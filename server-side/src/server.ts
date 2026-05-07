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
import { authorizeRole } from './middleware/role.middleware'; // <--- Siguraduhing naka-import ito
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:4200" }
});

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @openapi
 * /api/upload:
 *   post:
 *     summary: Upload a file to Supabase Storage
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 */
// UPDATE DITO: Idinagdag natin ang authorizeRole(['student', 'admin'])
app.post('/api/upload', 
  authenticateToken, 
  authorizeRole(['student', 'admin']), // <--- Papayagan na si KC at Julianne (students)
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

// Helper para sa inyong testing session (In-update para sa student testing)
app.get('/api/get-student-token', (req, res) => {
    const token = jwt.sign(
        { id: 101, role: 'student' }, // Testing as student
        process.env.JWT_SECRET as string, 
        { expiresIn: '1h' }
    );
    res.json({ token });
});

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);

setupSwagger(app);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
});

server.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
    console.log('📄 Swagger Docs available at http://localhost:3000/api-docs');
});