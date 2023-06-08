import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import TokenModel from './models/token.model';
import { TokenClass, TokenSchema } from './schemas/token.schema';
import { TokenService } from './token.service';

@Module({
  imports: [
    TokenModel,
    JwtModule
  ],
  providers: [TokenService],
  exports: [TokenService]
})
export class TokenModule {}
