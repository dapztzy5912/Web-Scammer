const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
        }
    }
}).array('proofImages', 6); // Max 6 files

// In-memory database (replace with real database in production)
let scammers = [];

// API Routes
app.get('/api/scammers', (req, res) => {
    res.json(scammers);
});

app.post('/api/scammers', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        
        try {
            const files = req.files || [];
            if (files.length === 0) {
                return res.status(400).json({ success: false, message: 'Minimal 1 bukti foto diperlukan' });
            }
            
            const proofImages = files.map(file => file.filename);
            
            const newScammer = {
                id: Date.now().toString(),
                name: req.body.scammerName,
                scamType: req.body.scamType,
                phoneNumber: req.body.phoneNumber || null,
                websiteUrl: req.body.websiteUrl || null,
                description: req.body.description || null,
                proofImages: proofImages,
                createdAt: new Date().toISOString()
            };
            
            scammers.unshift(newScammer); // Add to beginning of array
            
            res.json({ success: true, scammer: newScammer });
        } catch (error) {
            console.error('Error adding scammer:', error);
            res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
        }
    });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
