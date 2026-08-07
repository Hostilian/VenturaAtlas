import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../shared/types/auth';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, error: 'Unauthenticated request' });
      return;
    }

    const hasRole = allowedRoles.some(role => user.roles.includes(role));
    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: `Forbidden: Requires one of roles [${allowedRoles.join(', ')}]`
      });
      return;
    }

    next();
  };
}
