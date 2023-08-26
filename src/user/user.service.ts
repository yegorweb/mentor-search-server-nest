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

  hasAccess(roles: string[], user: User | UserFromClient) {
    return this.RolesService.isAdminOfSchool(roles, new mongoose.Types.ObjectId(user.school._id).toString()) ||
           this.RolesService.isAdminOfTown(roles, new mongoose.Types.ObjectId(user.town._id).toString()) ||
           this.RolesService.isGlobalAdmin(roles)
  }

  async checkAccessToRoles(
    assigning_user_roles: string[], 
    old_subject_roles: string[],
    new_subject_roles: string[]
  ) {
    if (this.RolesService.isGlobalAdmin(assigning_user_roles))
      return

    let pushed_roles = new_subject_roles.filter(role => !old_subject_roles.includes(role))
    let pulled_roles = old_subject_roles.filter(role => !new_subject_roles.includes(role))

    if (!pushed_roles.every(role => assigning_user_roles.includes(role)))
      throw ApiError.AccessDenied()

    if (pulled_roles.some(role => role === 'global-admin'))
      throw ApiError.AccessDenied()

    if (
      this.RolesService.getTownIdsFromRoles(pulled_roles).length > 0 &&
      !this.RolesService.isGlobalAdmin(assigning_user_roles)
    )
      throw ApiError.AccessDenied()

    if (this.RolesService.getSchoolIdsFromRoles(pulled_roles).length > 0) {
      let administered_towns_ids = this.RolesService.getTownObjectIdsFromRoles(assigning_user_roles)

      if (administered_towns_ids.length === 0)
        throw ApiError.AccessDenied()

      for (let school_id in this.RolesService.getSchoolIdsFromRoles(pulled_roles)) {
        let school = await this.SchoolModel.findById(school_id)

        if (!administered_towns_ids.some(town_id => town_id != school.town._id))
          throw ApiError.AccessDenied()
      }
    }
  }
}
