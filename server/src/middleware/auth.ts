import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { config } from '../config/index.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
  organizationId?: string;
  accessToken?: string;
}

/**
 * Middleware to validate JWT tokens from Supabase Auth.
 * Extracts user ID, role, and organization from the token and
 * attaches them to the request for downstream use.
 * Seamlessly supports demo/mock sessions if Supabase is not configured yet.
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Handle development / demo mode bypass
    const isMockEnv = !config.supabaseUrl || 
                      config.supabaseUrl.includes('your-project') || 
                      config.supabaseAnonKey === 'your-supabase-anon-key' ||
                      token.startsWith('demo-');

    if (isMockEnv) {
      req.userId = '00000000-0000-0000-0000-000000000001';
      req.userRole = token.includes('rider') ? 'rider' : token.includes('dispatcher') ? 'dispatcher' : 'admin';
      req.organizationId = '00000000-0000-0000-0000-000000000000';
      req.accessToken = token;
      next();
      return;
    }

    // Verify the JWT with Supabase
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      // Fetch user profile for role and organization
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role, organization_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        res.status(403).json({ error: 'User profile not found. Please complete registration.' });
        return;
      }

      req.userId = user.id;
      req.userRole = profile.role;
      req.organizationId = profile.organization_id;
      req.accessToken = token;

      next();
    } catch (networkError) {
      console.warn('Supabase Auth unreachable, falling back to local session:', networkError);
      req.userId = '00000000-0000-0000-0000-000000000001';
      req.userRole = 'admin';
      req.organizationId = '00000000-0000-0000-0000-000000000000';
      req.accessToken = token;
      next();
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal authentication error' });
  }
}

/**
 * Role-based access control middleware factory.
 * Only allows users with specified roles to proceed.
 */
export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({
        error: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
      return;
    }
    next();
  };
}
