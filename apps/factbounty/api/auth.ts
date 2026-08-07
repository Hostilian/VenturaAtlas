import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';
import { AuthenticatedPrincipal, UserRole } from '../shared/types/auth';
import { FactBountyConfig } from '../config';

export function createAuthMiddleware(config: FactBountyConfig) {
  const secretKey = new TextEncoder().encode(config.FACTBOUNTY_JWT_SECRET);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { payload } = await jose.jwtVerify(token, secretKey, {
          algorithms: ['HS256']
        });

        const userId = payload.sub;
        const roles = (payload['roles'] as UserRole[]) || [];

        if (!userId) {
          res.status(401).json({ success: false, error: 'Invalid token principal' });
          return;
        }

        req.user = { userId, roles };
        next();
        return;
      } catch (err: any) {
        res.status(401).json({ success: false, error: `Authentication failed: ${err.message}` });
        return;
      }
    }

    // Demo Mode fallback for local non-production testing
    if (config.FACTBOUNTY_DEMO_MODE && config.NODE_ENV !== 'production') {
      const demoRole = (req.headers['x-demo-role'] as UserRole) || 'buyer';
      const demoUserId = (req.headers['x-demo-user-id'] as string) || `demo_${demoRole}_1`;

      req.user = {
        userId: demoUserId,
        roles: [demoRole, 'admin'] // In demo mode grant role and admin for local simplicity
      };
      next();
      return;
    }

    res.status(401).json({ success: false, error: 'Missing Authorization header' });
  };
}

export async function generateDemoToken(
  userId: string,
  roles: UserRole[],
  secret: string
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);
  return new jose.SignJWT({ roles })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secretKey);
}
