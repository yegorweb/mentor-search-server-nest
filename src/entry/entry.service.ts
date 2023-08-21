import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { RolesService } from 'src/roles/roles.service';
import { UserFromClient } from 'src/user/interfaces/user-from-client.interface';
import { User } from 'src/user/interfaces/user.interface';
import EntryFromClient from './interfaces/entry-from-client.interface';
import Entry from './interfaces/entry.interface';

@Injectable()
export class EntryService {
  constructor(
    private RolesService: RolesService
  ) {}

  isAdmin(user: User | UserFromClient, document: Entry | EntryFromClient): boolean {
    return (
      this.RolesService.isAdminOfSchool(
        user.roles, 
        new mongoose.Types.ObjectId(document.school._id).toString()
      )
    ) 
      || 
    this.RolesService.isGlobalAdmin(user.roles)
  }
  
  isAuthor(user: User | UserFromClient, document: Entry | EntryFromClient): boolean {
    return user._id == document.author._id
  }

  }
}
