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

    let success_to_push = (await Promise.all(pushed_roles.map(async role => await this.hasAccessToPushRole(assigning_user_roles, role)))).every(value => value)
    let success_to_pull = (await Promise.all(pulled_roles.map(async role => await this.hasAccessToPullRole(assigning_user_roles, role)))).every(value => value)

    if (!success_to_push || !success_to_pull)
      throw ApiError.AccessDenied()
  }

  async hasAccessToPushRole(user_roles: string[], role: string) {
    if (this.RolesService.isOwner([role])) 
      return false

    if (this.RolesService.isGlobalAdmin([role]))
      return this.RolesService.isOwner(user_roles)
    
    if (this.RolesService.isGlobalAdmin(user_roles) || user_roles.includes(role))
      return true
    
    if (this.RolesService.getSchoolIdsFromRoles([role]).length) {
      let school = await this.SchoolModel.findById(this.RolesService.getIdFromRole(role))
      return this.RolesService.isAdminOfTown(user_roles, school.town._id.toString())
    }

    return true
  }
  
  async hasAccessToPullRole(user_roles: string[], role: string) {
    if (this.RolesService.isOwner([role])) 
      return false

    if (this.RolesService.isGlobalAdmin([role]))
      return this.RolesService.isOwner(user_roles)

    if (this.RolesService.isGlobalAdmin(user_roles))
      return true
    
    if (this.RolesService.getSchoolIdsFromRoles([role]).length) {
      let school = await this.SchoolModel.findById(this.RolesService.getIdFromRole(role))
      return this.RolesService.isAdminOfTown(user_roles, school.town._id.toString())
    }      

    return true
  }
}
