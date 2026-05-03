import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:4200" }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

server.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
});