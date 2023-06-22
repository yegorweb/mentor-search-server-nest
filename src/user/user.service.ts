import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { RolesService } from 'src/roles/roles.service';
import { UserFromClient } from './interfaces/user-from-client.interface';
import { User } from './interfaces/user.interface';

@Injectable()
export class UserService {
  constructor(
    private RolesService: RolesService
  ) {}

  hasAccess(roles: string[], user: User | UserFromClient) {
    return this.RolesService.isAdminOfSchool(roles, new mongoose.Types.ObjectId(user.school._id).toString()) ||
           this.RolesService.isAdminOfTown(roles, new mongoose.Types.ObjectId(user.town._id).toString()) ||
           this.RolesService.isGlobalAdmin(roles)
  }
}
