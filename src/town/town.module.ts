import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesService } from 'src/roles/roles.service';
import TownModel from './models/town.model';
import { TownClass, TownSchema } from './schemas/town.schema';
import { TownController } from './town.controller';

@Module({
  imports: [
    TownModel,
    JwtModule
  ],
  controllers: [TownController],
  providers: [RolesService]
})
export class TownModule {}
