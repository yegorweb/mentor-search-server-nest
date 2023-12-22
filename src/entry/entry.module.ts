import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RolesService } from 'src/roles/roles.service';
import SchoolModel from 'src/school/models/school.model';
import { SchoolService } from 'src/school/school.service';
import { TokenModule } from 'src/token/token.module';
import { EntryController } from './entry.controller';
import { EntryService } from './entry.service';
import EntryModel from './models/entry.model';

@Module({
  imports: [
    EntryModel,
    TokenModule,
    JwtModule,
    SchoolModel,
  ],
  controllers: [EntryController],
  providers: [EntryService, RolesService, SchoolService],
})
export class EntryModule {}
