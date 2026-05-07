import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access Denied" });

  // Gagamit na ng process.env.JWT_SECRET
  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid Token" });
    req.user = user; 
    next();
  });
};

export const authorizeAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user && req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admins only!" });
  }
  next();
};