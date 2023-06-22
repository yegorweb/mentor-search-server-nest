import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import EntryModel from 'src/entry/models/entry.model';
import { RolesService } from 'src/roles/roles.service';
import SchoolModel from 'src/school/models/school.model';
import { SchoolService } from 'src/school/school.service';
import UserModel from './models/user.model';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    UserModel,
    EntryModel,
    SchoolModel,
    JwtModule
  ],
  controllers: [UserController],
  providers: [RolesService, UserService, SchoolService]
})
export class UserModule {}
