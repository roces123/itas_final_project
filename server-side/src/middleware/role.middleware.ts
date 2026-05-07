import { Request, Response, NextFunction } from 'express';

export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user; 

    // Debugging: Tingnan mo ito sa terminal ng VS Code
    console.log("Checking Access for Role:", user?.role);

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not have the required permissions.' 
      });
    }

    next();
  };
};