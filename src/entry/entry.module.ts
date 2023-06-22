import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RolesService } from 'src/roles/roles.service';
import { TokenModule } from 'src/token/token.module';
import { EntryController } from './entry.controller';
import { EntryService } from './entry.service';
import EntryModel from './models/entry.model';

@Module({
  imports: [
    EntryModel,
    TokenModule,
    JwtModule
  ],
  controllers: [EntryController],
  providers: [EntryService, RolesService],
})
export class EntryModule {}
