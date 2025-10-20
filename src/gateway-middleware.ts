import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from './error-handler';
import JWT from 'jsonwebtoken';

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
