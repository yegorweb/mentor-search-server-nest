import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import ApiError from 'src/exceptions/errors/api-error';
import { RolesService } from 'src/roles/roles.service';
import { SchoolClass } from 'src/school/schemas/school.schema';
import { UserFromClient } from 'src/user/interfaces/user-from-client.interface';
import { User } from 'src/user/interfaces/user.interface';
import EntryFromClient from './interfaces/entry-from-client.interface';
import Entry from './interfaces/entry.interface';
import { EntryClass } from './schemas/entry.schema';

@Injectable()
export class EntryService {
  constructor(
    @InjectModel('Entry') private EntryModel: Model<EntryClass>,
    @InjectModel('School') private SchoolModel: Model<SchoolClass>,
    private RolesService: RolesService
  ) {}

  isAdmin(roles: string[], document: Entry | EntryFromClient): boolean {
    return (
      this.RolesService.isAdminOfSchool(
        roles, 
        new mongoose.Types.ObjectId(document.school._id).toString()
      ) || 
      this.RolesService.isAdminOfTown(
        roles, 
        new mongoose.Types.ObjectId(document.school.town._id).toString()
      ) ||
      this.RolesService.isGlobalAdmin(roles)
    )
  }

  async beforeCreateIsAdmin(roles: string[], entry): Promise<boolean> {
    let town = await this.SchoolModel.findById(entry.school)
    return (
      this.RolesService.isAdminOfSchool(
        roles, entry.school
      ) || 
      this.RolesService.isAdminOfTown(
        roles, town._id.toString()
      ) ||
      this.RolesService.isGlobalAdmin(roles)
    )
  }
  
  isAuthor(user: User | UserFromClient, document: Entry | EntryFromClient): boolean {
    return user._id == document.author._id
  }

  async checkLimit(user: User | UserFromClient) {
    if (this.RolesService.isSomeAdmin(user.roles))
      return

    if ((await this.EntryModel.find({ 
      author: new mongoose.Types.ObjectId(user._id), 
      date: { 
        $gte: Date.now() - 1000*60*60*24, 
        $lt: Date.now() 
      } 
    })).length > 10)
      throw ApiError.BadRequest('Превышен лимит создания за день. Успокойтесь или вас удалят') 
  }
}
