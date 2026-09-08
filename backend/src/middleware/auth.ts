import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'placepro-super-secret-sih-jwt-key-2026';

export interface AuthUser {
  userId: string;
  id?: string;
  fullName?: string;
  email: string;
  role: string;
  studentId?: string;
  industryId?: string;
  institutionId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Only allow demo header fallback in non-production environments when specifically requested
    if (process.env.NODE_ENV !== 'production') {
      const demoRole = (req.headers['x-demo-role'] as string) || 'STUDENT';
      const demoUserId = req.headers['x-demo-user-id'] as string;
      if (demoUserId) {
        req.user = { userId: demoUserId, email: 'demo@placepro.edu', role: demoRole };
        return next();
      }
    }
    return res.status(401).json({
      success: false,
      error: 'Authentication token required',
      message: 'Authentication token required',
      code: 'AUTH_TOKEN_REQUIRED'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    const msg = err.name === 'TokenExpiredError' ? 'Authentication token has expired' : 'Invalid authentication token';
    return res.status(403).json({
      success: false,
      error: msg,
      message: msg,
      code: 'INVALID_AUTH_TOKEN'
    });
  }
}

export function requireRole(...allowedRoles: string[]) {
  const upperRoles = allowedRoles.map((r) => r.toUpperCase());
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';
    if (!upperRoles.includes(userRole)) {
      const msg = `Forbidden: Access restricted. Required role: ${allowedRoles.join(' or ')}`;
      return res.status(403).json({
        success: false,
        error: msg,
        message: msg,
        code: 'FORBIDDEN_ROLE_REQUIRED'
      });
    }
    next();
  };
}
