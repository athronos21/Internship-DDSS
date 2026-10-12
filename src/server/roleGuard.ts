import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import { auth, authDb } from './auth.js';
import { User, UserRole } from '../types.js';
import { getEffectiveRole, hasPermission, Permission } from '../utils/roleManager.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Retrieve the current authenticated user from verified Better Auth session cookies or Bearer tokens.
 * Unauthenticated requests and forged headers return null. No default fallback user is permitted.
 */
export async function getAuthenticatedUser(req: Request): Promise<User | null> {
  if ((req as AuthenticatedRequest).user) {
    return (req as AuthenticatedRequest).user!;
  }

  const authHeader = req.headers?.['authorization'];
  const cookieHeader = req.headers?.['cookie'];

  // Under NO circumstances do we trust unauthenticated requests or forged x-user-id
  if (!authHeader && !cookieHeader) {
    return null;
  }

  // 1. Try Better Auth getSession
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });
    if (session?.user) {
      const user = db.users.find(
        (u) =>
          u.id === session.user.id ||
          (session.user.email && u.email?.toLowerCase() === session.user.email.toLowerCase())
      );
      if (user) return user;

      return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as any).role || 'PHARMACIST',
        isActive: true,
        createdAt: (session.user as any).createdAt || new Date().toISOString(),
      } as User;
    }
  } catch {
    // Proceed to token inspection
  }

  // 2. Direct Bearer token session check in authDb
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token && authDb) {
      try {
        const sessionRow = authDb.query('SELECT * FROM session WHERE token = ?').get(token);
        if (sessionRow && new Date(sessionRow.expiresAt) > new Date()) {
          const userRow = authDb.query('SELECT * FROM user WHERE id = ?').get(sessionRow.userId);
          if (userRow) {
            const user = db.users.find(
              (u) =>
                u.id === userRow.id ||
                (userRow.email && u.email?.toLowerCase() === userRow.email.toLowerCase())
            );
            if (user) return user;

            return {
              id: userRow.id,
              name: userRow.name,
              email: userRow.email,
              role: userRow.role || 'PHARMACIST',
              isActive: true,
              createdAt: userRow.createdAt,
            } as User;
          }
        }
      } catch {
        // Ignore DB query errors
      }
    }
  }

  return null;
}

/**
 * Express Middleware requiring an authenticated user session.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user) {
    return next();
  }

  const authHeader = req.headers?.authorization;
  const cookieHeader = req.headers?.cookie;

  if (!authHeader && !cookieHeader) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication required to access this resource.',
    });
  }

  getAuthenticatedUser(req)
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required to access this resource.',
        });
      }
      req.user = user;
      next();
    })
    .catch(() => {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required to access this resource.',
      });
    });
}

/**
 * Express Middleware to require one of the specified canonical UserRoles.
 * Supports both rest arguments (requireRole('PHARMACIST', 'STORE_OWNER'))
 * and array argument (requireRole(['PHARMACIST', 'STORE_OWNER'])).
 */
export function requireRole(...roles: (UserRole | UserRole[])[]) {
  const allowedRoles = roles.flat();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const checkRole = (user: User | null) => {
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required to access this resource.',
        });
      }

      req.user = user;
      const effectiveRole = getEffectiveRole(user);

      // Super Admin has master access override across all endpoints
      if (effectiveRole === 'SUPER_ADMIN') {
        return next();
      }

      if (!allowedRoles.includes(effectiveRole)) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN_ROLE',
          message: `Access denied. This action requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is '${effectiveRole}'.`,
          requiredRoles: allowedRoles,
          currentRole: effectiveRole,
        });
      }

      next();
    };

    if (req.user) {
      return checkRole(req.user);
    }

    const authHeader = req.headers?.authorization;
    const cookieHeader = req.headers?.cookie;

    if (!authHeader && !cookieHeader) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required to access this resource.',
      });
    }

    getAuthenticatedUser(req)
      .then((user) => checkRole(user))
      .catch(() => {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required to access this resource.',
        });
      });
  };
}

/**
 * Express Middleware to require a specific fine-grained Permission.
 */
export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const checkPermission = (user: User | null) => {
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required to access this resource.',
        });
      }

      req.user = user;
      const effectiveRole = getEffectiveRole(user);

      if (hasPermission(user, permission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN_PERMISSION',
        message: `Access denied. You do not possess the required permission: '${permission}'.`,
        requiredPermission: permission,
        currentRole: effectiveRole,
      });
    };

    if (req.user) {
      return checkPermission(req.user);
    }

    const authHeader = req.headers?.authorization;
    const cookieHeader = req.headers?.cookie;

    if (!authHeader && !cookieHeader) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required to access this resource.',
      });
    }

    getAuthenticatedUser(req)
      .then((user) => checkPermission(user))
      .catch(() => {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required to access this resource.',
        });
      });
  };
}
