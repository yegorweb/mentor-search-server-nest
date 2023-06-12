import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from 'src/token/token.module';
import SchoolModel from './models/school.model';
import { SchoolController } from './school.controller';

@Module({
  imports: [
    SchoolModel,
    TokenModule,
    JwtModule
  ],
  controllers: [SchoolController],
})
export class SchoolModule {}
