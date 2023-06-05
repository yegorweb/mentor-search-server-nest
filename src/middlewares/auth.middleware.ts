import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request } from 'express';
import ApiError from 'src/exceptions/errors/api-error';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private TokenService: TokenService) {}

  use(req: Request, next: NextFunction) {
    try {
      const authorizationHeader = req.headers.authorization
  
      if (!authorizationHeader) {
        return next(ApiError.UnauthorizedError())
      }
  
      const accessToken = authorizationHeader.split(' ')[1]
      if (!accessToken) {
        return next(ApiError.UnauthorizedError())
      }
  
      const userData = this.TokenService.validateAccessToken(accessToken)
      if (!userData) {
        return next(ApiError.UnauthorizedError())
      }
  
      req.body.visitor = userData
  
      next()
    } catch (error) {
      return next(ApiError.UnauthorizedError())
    }
  }
}
