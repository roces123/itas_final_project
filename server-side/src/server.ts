import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import authRoutes from './routes/auth.routes';
import requestRoutes from './routes/request.routes';
import { setupSwagger } from './swagger'; 
import { supabase } from './config/supabase';
import { authenticateToken } from './middleware/auth.middleware';
import { authorizeRole } from './middleware/role.middleware';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Dynamic PORT for Deployment
const PORT = process.env.PORT || 3000;

// Dynamic CORS Configuration
const allowedOrigins = [
  "http://localhost:4200", 
  process.env.FRONTEND_URL || "" // Siguraduhin na ang FRONTEND_URL sa Render ay yung Vercel link niyo
];

const io = new Server(server, {
    cors: { 
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] // Dinagdagan para sa socket updates
    }
});

// Middleware setup
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] // Tiyaking allowed ang lahat ng methods
}));

app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @openapi
 * /api/upload:
 * post:
 * summary: Upload a file to Supabase Storage
 * tags: [File Upload]
 * security:
 * - bearerAuth: []
 */
app.post('/api/upload', 
  authenticateToken, 
  authorizeRole(['student', 'admin']), 
  upload.single('file'), 
  async (req: any, res: any) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        const fileName = `${Date.now()}_${file.originalname}`;

        const { data, error } = await supabase.storage
            .from('documents')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) throw error;

        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName);

        res.status(200).json({ 
            message: 'Upload success!', 
            url: urlData.publicUrl 
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Helper para sa testing session
app.get('/api/get-student-token', (req, res) => {
    const token = jwt.sign(
        { id: 101, role: 'student' }, 
        process.env.JWT_SECRET as string, 
        { expiresIn: '1h' }
    );
    res.json({ token });
});

// --- ROUTES SECTION ---

// Auth Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // Fallback para sa non-api prefix

// Request Routes
// Ito ang fix para sa 404 Error mo sa PUT at DELETE
app.use('/api/requests', requestRoutes); 
app.use('/requests', requestRoutes);     // Fallback: Kahit walang /api sa frontend, gagana na ito

// Documentation
setupSwagger(app);

// Socket.io connection logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
});

// Start the server
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`📄 Swagger Docs: http://localhost:${PORT}/api-docs`);
    }
});