import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from 'src/token/token.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserClass, UserSchema } from 'src/user/schemas/user.schema';
import { TokenModule } from 'src/token/token.module';
import UserModel from 'src/user/models/user.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TokenModule,
    UserModel,
    JwtModule
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
