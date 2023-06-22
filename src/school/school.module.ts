import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RolesService } from 'src/roles/roles.service';
import { TokenModule } from 'src/token/token.module';
import SchoolModel from './models/school.model';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';

@Global()
@Module({
  imports: [
    SchoolModel,
    TokenModule,
    JwtModule
  ],
  controllers: [SchoolController],
  providers: [RolesService, SchoolService]
})
export class SchoolModule {}
