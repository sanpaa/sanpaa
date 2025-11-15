const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'properties.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from root directory
app.use(express.static(__dirname, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Serve admin panel
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
