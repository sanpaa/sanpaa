const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const fssync = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'properties.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fssync.existsSync(UPLOADS_DIR)) {
    fssync.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
        }
    }
});

// Simple admin credentials (in production, use database)
const ADMIN_USER = 'admin';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10); // Change this password!

// Simple token store (in production, use JWT or session management)
const activeTokens = new Set();

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Rate limiting for static files
const staticLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // More generous limit for static files
    message: 'Too many requests, please try again later.'
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/api/', apiLimiter);

// Serve Angular app static files
app.use(express.static(path.join(__dirname, 'frontend/dist/frontend/browser'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Serve admin panel with restricted access
app.use('/admin-legacy', express.static(path.join(__dirname, 'admin'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Ensure data directory and file exist
async function initializeData() {
    try {
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
        try {
            await fs.access(DATA_FILE);
        } catch {
            await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
        }
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// Read properties from file
async function readProperties() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading properties:', error);
        return [];
    }
}

// Write properties to file
async function writeProperties(properties) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(properties, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing properties:', error);
        return false;
    }
}

// API Routes

// Serve uploaded images
app.use('/uploads', express.static(UPLOADS_DIR));

// Image upload endpoint
app.post('/api/upload', upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
        }
        
        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        res.json({ imageUrls });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Erro ao fazer upload das imagens' });
    }
});

// AI Suggestions endpoint  
app.post('/api/ai/suggest', apiLimiter, async (req, res) => {
    try {
        const { title, description, type, bedrooms, bathrooms, area, parking, city, neighborhood } = req.body;
        
        console.log('✨ AI REQUEST:', { title, description, type, bedrooms, area });
        
        if (!title && !description) {
            return res.status(400).json({ error: 'Digite título ou descrição' });
        }
        
        // SMART AI: Extract ALL data from text
        const text = (title || '') + ' ' + (description || '');
        const textLower = text.toLowerCase();
        
        // Extract bedrooms
        const bedroomsMatch = textLower.match(/(\d+)\s*(quarto|quart|qto|bedroom|qt)/i);
        const extractedBedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1]) : (bedrooms || null);
        
        // Extract bathrooms  
        const bathroomsMatch = textLower.match(/(\d+)\s*(banheiro|banh|bathroom|wc|bwc)/i);
        const extractedBathrooms = bathroomsMatch ? parseInt(bathroomsMatch[1]) : (bathrooms || null);
        
        // Extract area
        const areaMatch = textLower.match(/(\d+)\s*(m²|m2|metros|metro)/i);
        const extractedArea = areaMatch ? parseInt(areaMatch[1]) : (area ? parseInt(area) : null);
        
        // Extract parking
        const parkingMatch = textLower.match(/(\d+)\s*(vaga|garagem|parking|garage)/i);
        const extractedParking = parkingMatch ? parseInt(parkingMatch[1]) : (parking || null);
        
        console.log('✅ EXTRACTED:', { bedrooms: extractedBedrooms, bathrooms: extractedBathrooms, area: extractedArea, parking: extractedParking });
        
        // Generate TITLE from description if missing
        let generatedTitle = title;
        if (!title && description) {
            const propertyType = type || 'Imóvel';
            const location = neighborhood || city || '';
            const rooms = extractedBedrooms ? `${extractedBedrooms} Quartos` : '';
            const areaInfo = extractedArea ? `${extractedArea}m²` : '';
            
            generatedTitle = `${propertyType} ${rooms} ${location} ${areaInfo}`.trim().replace(/\s+/g, ' ');
            
            // Add special features mentioned
            if (textLower.includes('piscina')) generatedTitle += ' com Piscina';
            if (textLower.includes('churrasqueira')) generatedTitle += ' e Churrasqueira';
            if (textLower.includes('varanda') || textLower.includes('sacada')) generatedTitle += ' com Varanda';
            
            // Limit to 80 chars
            if (generatedTitle.length > 80) {
                generatedTitle = generatedTitle.substring(0, 77) + '...';
            }
        }
        
        // Generate DESCRIPTION from title if missing
        let generatedDescription = description;
        if (!description && title) {
            const propertyType = type || 'imóvel';
            const features = [];
            
            if (extractedBedrooms) features.push(`${extractedBedrooms} ${extractedBedrooms > 1 ? 'quartos' : 'quarto'}`);
            if (extractedBathrooms) features.push(`${extractedBathrooms} ${extractedBathrooms > 1 ? 'banheiros' : 'banheiro'}`);
            if (extractedArea) features.push(`${extractedArea}m² de área`);
            if (extractedParking) features.push(`${extractedParking} ${extractedParking > 1 ? 'vagas' : 'vaga'} de garagem`);
            
            // Add detected amenities
            if (textLower.includes('piscina')) features.push('piscina');
            if (textLower.includes('churrasqueira')) features.push('churrasqueira');
            if (textLower.includes('varanda') || textLower.includes('sacada')) features.push('varanda gourmet');
            if (textLower.includes('armário') || textLower.includes('armarios')) features.push('armários embutidos');
            if (textLower.includes('suite') || textLower.includes('suíte')) features.push('suíte');
            
            const loc = neighborhood || city || 'excelente localização';
            const featuresText = features.length > 0 ? `com ${features.join(', ')}` : '';
            
            generatedDescription = `Excelente ${propertyType} ${featuresText}. Localizado em ${loc}, oferece conforto e praticidade para você e sua família. ${extractedArea ? `Imóvel de ${extractedArea}m²` : 'Espaço amplo'} em localização privilegiada. Agende sua visita e conheça este imóvel incrível!`;
        }
        
        // SMART PRICE SUGGESTION
        let priceHint = 'Consulte-nos para avaliação';
        const finalArea = extractedArea;
        if (finalArea) {
            const locationLower = ((city || '') + ' ' + (neighborhood || '')).toLowerCase();
            let pricePerM2 = 4000; // Default
            
            // Premium areas
            if (locationLower.includes('jardins') || locationLower.includes('itaim') || locationLower.includes('moema') || locationLower.includes('vila olimpia') || locationLower.includes('leblon') || locationLower.includes('ipanema')) {
                pricePerM2 = 10000;
            } else if (locationLower.includes('são paulo') || locationLower.includes('sp') || locationLower.includes('rio') || locationLower.includes('rj')) {
                pricePerM2 = 7000;
            } else if (locationLower.includes('centro')) {
                pricePerM2 = 5500;
            }
            
            // Adjust for property type
            if (type && type.toLowerCase().includes('apartamento')) {
                pricePerM2 *= 1.1; // Apartments slightly more expensive per m²
            }
            
            const estimatedPrice = Math.round(finalArea * pricePerM2);
            priceHint = `R$ ${estimatedPrice.toLocaleString('pt-BR')}`;
        }
        
        const suggestions = {
            title: generatedTitle || `${type || 'Imóvel'} em ${neighborhood || city || 'Ótima Localização'}`,
            description: generatedDescription || `Excelente ${type || 'imóvel'} em ${neighborhood || city || 'ótima localização'}. Agende sua visita!`,
            bedrooms: extractedBedrooms,
            bathrooms: extractedBathrooms,
            area: extractedArea,
            parking: extractedParking,
            priceHint: priceHint
        };
        
        console.log('✅ AI GENERATED:', suggestions);
        res.json(suggestions);
        
    } catch (error) {
        console.error('❌ AI ERROR:', error);
        res.status(500).json({ error: 'Erro ao gerar sugestões' });
    }
});

// CEP Lookup endpoint
app.get('/api/cep/:cep', async (req, res) => {
    try {
        const cep = req.params.cep.replace(/\D/g, '');
        if (cep.length !== 8) {
            return res.status(400).json({ error: 'CEP inválido' });
        }
        
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        
        if (response.data.erro) {
            return res.status(404).json({ error: 'CEP não encontrado' });
        }
        
        res.json({
            cep: response.data.cep,
            street: response.data.logradouro,
            neighborhood: response.data.bairro,
            city: response.data.localidade,
            state: response.data.uf,
            // Nominatim uses a simpler geocoding format
            address: `${response.data.logradouro}, ${response.data.bairro}, ${response.data.localidade}, ${response.data.uf}, Brasil`
        });
    } catch (error) {
        console.error('CEP lookup error:', error);
        res.status(500).json({ error: 'Erro ao buscar CEP' });
    }
});

// Geocoding endpoint (converts address to lat/lng)
app.post('/api/geocode', async (req, res) => {
    try {
        const { address } = req.body;
        
        // Using Nominatim (OpenStreetMap) for geocoding - free and no API key required
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'AlancarmoCorretor/1.0'
            }
        });
        
        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            res.json({
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon)
            });
        } else {
            res.status(404).json({ error: 'Endereço não encontrado' });
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({ error: 'Erro ao geocodificar endereço' });
    }
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }
    
    if (username === ADMIN_USER && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
        // Generate simple token (in production, use JWT)
        const token = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64');
        activeTokens.add(token);
        
        res.json({ 
            success: true, 
            token,
            message: 'Login realizado com sucesso'
        });
    } else {
        res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        activeTokens.delete(token);
    }
    res.json({ success: true, message: 'Logout realizado com sucesso' });
});

app.get('/api/auth/verify', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token && activeTokens.has(token)) {
        res.json({ valid: true });
    } else {
        res.status(401).json({ valid: false });
    }
});

// Statistics endpoint
app.get('/api/stats', async (req, res) => {
    const properties = await readProperties();
    
    const stats = {
        total: properties.length,
        available: properties.filter(p => !p.sold).length,
        sold: properties.filter(p => p.sold).length,
        featured: properties.filter(p => p.featured && !p.sold).length,
        byType: {}
    };
    
    // Count by type
    properties.forEach(p => {
        const type = p.type || 'Outro';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
    });
    
    res.json(stats);
});

// Get all properties
app.get('/api/properties', async (req, res) => {
    const properties = await readProperties();
    res.json(properties);
});

// Get single property
app.get('/api/properties/:id', async (req, res) => {
    const properties = await readProperties();
    const property = properties.find(p => p.id === req.params.id);
    if (property) {
        res.json(property);
    } else {
        res.status(404).json({ error: 'Property not found' });
    }
});

// Create new property
app.post('/api/properties', async (req, res) => {
    const properties = await readProperties();
    const newProperty = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...req.body
    };
    properties.push(newProperty);
    const success = await writeProperties(properties);
    if (success) {
        res.status(201).json(newProperty);
    } else {
        res.status(500).json({ error: 'Failed to create property' });
    }
});

// Update property
app.put('/api/properties/:id', async (req, res) => {
    const properties = await readProperties();
    const index = properties.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
        properties[index] = {
            ...properties[index],
            ...req.body,
            id: req.params.id,
            updatedAt: new Date().toISOString()
        };
        const success = await writeProperties(properties);
        if (success) {
            res.json(properties[index]);
        } else {
            res.status(500).json({ error: 'Failed to update property' });
        }
    } else {
        res.status(404).json({ error: 'Property not found' });
    }
});

// Delete property
app.delete('/api/properties/:id', async (req, res) => {
    const properties = await readProperties();
    const filteredProperties = properties.filter(p => p.id !== req.params.id);
    if (filteredProperties.length < properties.length) {
        const success = await writeProperties(filteredProperties);
        if (success) {
            res.json({ message: 'Property deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to delete property' });
        }
    } else {
        res.status(404).json({ error: 'Property not found' });
    }
});

// Serve Angular app for all other routes (SPA routing)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/frontend/browser/index.html'));
});

// Start server
async function startServer() {
    await initializeData();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Angular app: http://localhost:${PORT}`);
        console.log(`Legacy admin panel: http://localhost:${PORT}/admin-legacy`);
    });
}

startServer();
