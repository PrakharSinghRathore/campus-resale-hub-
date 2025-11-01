import { Request, Response, NextFunction } from 'express';
import { verifyIdToken } from '../config/firebase';
import User, { IUser } from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      firebaseUid?: string;
    }
  }
}

// Middleware to verify Firebase ID token
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Temporary local bypass for development only
    if (process.env.DEV_AUTH_BYPASS === 'true') {
      try {
        const devEmail = process.env.DEV_USER_EMAIL || 'dev@adapt.edu';
        let user = await User.findOne({ email: devEmail });
        if (!user) {
          user = new User({
            firebaseUid: 'DEV_UID',
            email: devEmail,
            name: 'Dev User',
            avatar: null,
            hostelBlock: 'Block A',
            isActive: true,
            isAdmin: true,
          });
          await user.save();
          console.log(`⚠️ DEV_AUTH_BYPASS enabled. Created dev user: ${devEmail}`);
        }
        req.user = user as any;
        req.firebaseUid = 'DEV_UID';
        return next();
      } catch (e) {
        console.error('DEV_AUTH_BYPASS failed to create/find dev user:', e);
      }
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No authorization header provided',
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Invalid authorization header format',
      });
    }

    // Verify Firebase ID token
    const decodedToken = await verifyIdToken(token);
    
    // Find user in database
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    // If user doesn't exist, create a new one
    if (!user) {
      user = new User({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email!,
        name: decodedToken.name || decodedToken.email!.split('@')[0],
        avatar: decodedToken.picture || null,
        isActive: true,
      });
      
      await user.save();
      console.log(`✅ New user created: ${user.email}`);
    } else {
      // Update last active timestamp
      user.lastActive = new Date();
      await user.save({ validateBeforeSave: false });
    }

    // Attach user to request
    req.user = user;
    req.firebaseUid = decodedToken.uid;
    
return next();
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    
    // Handle specific Firebase auth errors
    if (error.message.includes('expired')) {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please log in again',
      });
    }
    
    if (error.message.includes('invalid')) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication failed',
      });
    }
    
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Unable to verify token',
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in first',
    });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Admin privileges required',
    });
  }
  
  return next();
};

// Middleware to check if user is active
export const requireActiveUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in first',
    });
  }
  
  if (!req.user.isActive) {
    return res.status(403).json({
      error: 'Account suspended',
      message: 'Your account has been suspended. Please contact support.',
    });
  }
  
return next();
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip optional verification entirely when auth bypass is enabled
    if (process.env.DEV_AUTH_BYPASS === 'true') {
      return next();
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next();
    }

    // Try to verify token but don't fail if invalid
    try {
      const decodedToken = await verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decodedToken.uid });
      
      if (user) {
        req.user = user;
        req.firebaseUid = decodedToken.uid;
        
        // Update last active timestamp
        user.lastActive = new Date();
        await user.save({ validateBeforeSave: false });
      }
    } catch (tokenError) {
      // Ignore token verification errors in optional auth
      console.warn('Optional auth token verification failed:', tokenError);
    }
    
    return next();
  } catch (error) {
    // Don't fail the request for optional auth errors
    console.warn('Optional auth middleware error:', error);
return next();
  }
};

// Middleware to validate user owns resource
export const requireResourceOwner = (resourceUserIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in first',
      });
    }
    
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        error: 'Bad request',
        message: `Missing ${resourceUserIdField} parameter`,
      });
    }
    
    // Allow access if user is admin or owns the resource
    if (!(req.user as any).isAdmin && (req.user as any)._id.toString() !== resourceUserId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own resources',
      });
    }
    
    return next();
  };
};

// Middleware to rate limit by user
export const userRateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req.user as any)?._id?.toString() || req.ip;
    const now = Date.now();
    
    const userRequest = userRequests.get(userId);
    
    if (!userRequest || now > userRequest.resetTime) {
      // Reset or initialize user request counter
      userRequests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (userRequest.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((userRequest.resetTime - now) / 1000)} seconds.`,
        retryAfter: Math.ceil((userRequest.resetTime - now) / 1000),
      });
    }
    
    userRequest.count += 1;
    next();
  };
};

// Middleware to log user activity
export const logUserActivity = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      console.log(`📊 User Activity: ${req.user.email} - ${action} - ${req.method} ${req.path}`);
      
      // Update user's last active timestamp
      req.user.lastActive = new Date();
      req.user.save({ validateBeforeSave: false }).catch((err: any) => {
        console.error('Error updating user last active:', err);
      });
    }
    
return next();
  };
};