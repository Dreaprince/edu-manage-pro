// secret-check.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecretCheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const secret = req.headers['plateau-secret'];

    if (!secret) {
      throw new UnauthorizedException('Wrong header');
    }

    // Check if the secret header is provided and valid
    if (secret !== process.env.PLATEAU_SECRET) {
      throw new UnauthorizedException('Forbidden: Invalid Secret Key');
    }

    // If secret is correct, proceed to the next middleware or handler
    next();
  }
}
