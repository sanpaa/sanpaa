const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'properties.json');

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

// Serve only specific static files to avoid exposing server files
const allowedFiles = {
    'index.html': 'text/html',
    'buscar.html': 'text/html',
    'styles.css': 'text/css',
    'script.js': 'application/javascript',
    'buscar.js': 'application/javascript'
};

// Custom static file serving for main site
app.get('/:file', staticLimiter, (req, res, next) => {
    const fileName = req.params.file;
    if (allowedFiles[fileName]) {
        const filePath = path.join(__dirname, fileName);
        res.setHeader('Content-Type', allowedFiles[fileName]);
        res.sendFile(filePath, (err) => {
            if (err) {
                next();
            }
        });
    } else {
        next();
    }
});

// Serve admin panel with restricted access
app.use('/admin', express.static(path.join(__dirname, 'admin'), {
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

// Serve main website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
async function startServer() {
    await initializeData();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Admin panel: http://localhost:${PORT}/admin`);
    });
}

startServer();
