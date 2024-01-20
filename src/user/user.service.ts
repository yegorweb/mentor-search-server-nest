import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import ApiError from 'src/exceptions/errors/api-error';
import { RolesService } from 'src/roles/roles.service';
import { SchoolClass } from 'src/school/schemas/school.schema';
import { UserFromClient } from './interfaces/user-from-client.interface';
import { User } from './interfaces/user.interface';
import { Model } from 'mongoose'

@Injectable()
export class UserService {
  constructor(
    @InjectModel('School') private SchoolModel: Model<SchoolClass>,
    private RolesService: RolesService
  ) {}

  hasAccess(roles: string[], user: User | UserFromClient): boolean {
    return this.RolesService.isAdminOfSchool(roles, new mongoose.Types.ObjectId(user.school._id).toString()) ||
           this.RolesService.isAdminOfTown(roles, new mongoose.Types.ObjectId(user.school.town._id).toString()) ||
           this.RolesService.isGlobalAdmin(roles)
  }

  async checkAccessToRoles(
    assigning_user_roles: string[], 
    old_subject_roles: string[],
    new_subject_roles: string[]
  ): Promise<void> {
    let pushed_roles = new_subject_roles.filter(role => !old_subject_roles.includes(role))
    let pulled_roles = old_subject_roles.filter(role => !new_subject_roles.includes(role))

    if (pushed_roles.some(role => old_subject_roles.includes(role)))
      throw ApiError.AccessDenied('Такая роль уже существует')
    if (
      !pushed_roles.every(role => this.hasAccessToRole(assigning_user_roles, role)) &&
      !pulled_roles.every(role => this.hasAccessToRole(assigning_user_roles, role))
    )
      throw ApiError.AccessDenied()
  }

  async hasAccessToRole(user_roles: string[], role: string): Promise<boolean> {
    if (role === 'student')
      return true

    if (this.RolesService.isOwner([role]))
      return false
    
    if (this.RolesService.isOwner(user_roles))
      return true

    if (this.RolesService.isGlobalAdmin([role]))
      return false

    if (this.RolesService.getTownIdsFromRoles([role]).length)
      return this.RolesService.isGlobalAdmin(user_roles)
    
    if (this.RolesService.getSchoolIdsFromRoles([role]).length && !user_roles.includes(role)) {
      let administered_towns_ids = this.RolesService.getTownObjectIdsFromRoles(user_roles)
      if (!administered_towns_ids.length)
        return false

      let school = await this.SchoolModel.findById(this.RolesService.getSchoolIdsFromRoles([role])[0])

      if (administered_towns_ids.every(town_id => town_id != school.town._id))
        return false
      
      return true
    }

    if (!user_roles.includes(role))
      return false

    return true
  }
}
