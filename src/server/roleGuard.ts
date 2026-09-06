import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import { User, UserRole } from '../types.js';
import { getEffectiveRole, hasPermission, Permission, ROLE_CONFIGS } from '../utils/roleManager.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Retrieve the current authenticated user from request headers or fallback to default.
 */
export function getAuthenticatedUser(req: Request): User | null {
  const userId = (req.headers['x-user-id'] as string) || (req.headers['authorization']?.replace('Bearer ', ''));
  if (!userId) {
    // If no user specified in dev/local context, retrieve the first active user or null
    return db.users[0] || null;
  }

  const user = db.users.find((u) => u.id === userId || u.email?.toLowerCase() === userId.toLowerCase());
  return user || db.users[0] || null;
}

/**
 * Express Middleware to require one of the specified canonical UserRoles.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = getAuthenticatedUser(req);
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
}

/**
 * Express Middleware to require a specific fine-grained Permission.
 */
export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = getAuthenticatedUser(req);
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
}
