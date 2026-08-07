export type UserRole = 'buyer' | 'responder' | 'moderator' | 'admin';

export interface AuthenticatedPrincipal {
  userId: string;
  roles: readonly UserRole[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedPrincipal;
    }
  }
}
