import { Request, Response } from 'express';

// Dito muna mase-save ang data habang wala pang database
const tempUsers: any[] = [];

export const register = async (req: Request, res: Response) => {
    const { studentId, fullName, email, course, password } = req.body;
    tempUsers.push({ studentId, fullName, email, course, password });
    console.log("Registered:", fullName);
    res.status(201).json({ message: "Student Registered!" });
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = tempUsers.find(u => u.email === email && u.password === password);
    
    if (user || (email === 'admin@isufst.edu.ph' && password === 'admin123')) {
        res.status(200).json({ message: "Login Success", user: user || { fullName: 'Admin' } });
    } else {
        res.status(401).json({ message: "Invalid Credentials" });
    }
};