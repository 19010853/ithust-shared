import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError, CustomError } from './error-handler';
import JWT from 'jsonwebtoken';
import { Logger } from 'winston';
import { IAuthPayload } from './interfaces/auth.interface';

const tokens: string[] = ['auth', 'seller', 'gig', 'search', 'buyer', 'message', 'order', 'review'];

export function verifyGatewayRequest(req: Request, _res: Response, next: NextFunction): void {
    if (!req.headers?.gatewayToken) {
        throw new NotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: Request not coming from api gateway');
    }

    const token: string = req.headers?.gatewayToken as string;
    if (!token) {
        throw new NotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: Request not coming from api gateway');
    }

    try {
        const secret = process.env.GATEWAY_JWT_TOKEN;
        if (!secret) {
            throw new NotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: JWT secret not configured');
        }

        const payload = JWT.verify(token, secret) as unknown as { id: string; iat: number };
        if (!payload || typeof payload !== 'object' || !payload.id || !tokens.includes(payload.id)) {
            throw new NotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: Request payload is invalid');
        }
    } catch (error) {
        throw new NotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: Request not coming from api gateway');
    }
    next();
}

export function normalizeGatewayTokenHeader(req: Request, _res: Response, next: NextFunction): void {
  const token = req.headers['gatewaytoken'] || req.headers['gateway-token'] || req.headers['x-gateway-token'];
  if (token) {
    req.headers['gatewayToken'] = token as string;
  }
  next();
}

export function attachCurrentUser(jwtToken: string, skip?: (req: Request) => boolean) {
  return function(req: Request, _res: Response, next: NextFunction): void {
    if (skip && skip(req)) {
      return next();
    }
    try {
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const payload = JWT.verify(token, jwtToken) as IAuthPayload;
        req.currentUser = payload;
      }
    } catch (_e) {
      // skip invalid or missing token
    }
    next();
  };
}

export function createServiceErrorHandler(serviceName: string, logger: Logger) {
  return function(error: Error, _req: Request, res: Response, next: NextFunction): void {
    if (error instanceof CustomError) {
      logger.log('error', `${serviceName} ${error.comingFrom}:`, error);
      res.status(error.statusCode).json(error.serializedErrors());
      return;
    }
    next(error);
  };
}
