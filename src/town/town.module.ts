import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import TownModel from './models/town.model';
import { TownClass, TownSchema } from './schemas/town.schema';
import { TownController } from './town.controller';

@Module({
  imports: [
    TownModel
  ],
  controllers: [TownController]
})
export class TownModule {}
