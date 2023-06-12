import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import TownModel from './models/town.model';
import { TownClass, TownSchema } from './schemas/town.schema';
import { TownController } from './town.controller';

@Module({
  imports: [
    TownModel,
    JwtModule
  ],
  controllers: [TownController]
})
export class TownModule {}
