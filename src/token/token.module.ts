import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import TokenModel from './models/token.model';
import { TokenClass, TokenSchema } from './schemas/token.schema';
import { TokenService } from './token.service';

@Module({
  imports: [
    TokenModel
  ],
  providers: [TokenService],
  exports: [TokenService]
})
export class TokenModule {}
