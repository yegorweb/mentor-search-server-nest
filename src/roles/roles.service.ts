import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class RolesService {
  getIdFromRole(role: string): string {
    return role.split('-')[2]
  }

  getObjectIdFromRole(role: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(this.getIdFromRole(role))
  }

  getSchoolIdsFromRoles(roles: string[]): string[] {
    return roles
      .filter(role => role.includes('school-admin-'))
      .map(role => this.getIdFromRole(role))
  }

  getSchoolIdFromRole(role: string): string {
    return role.split('school-admin-')[1]
  }

  getSchoolObjectIdsFromRoles(roles: string[]): mongoose.Types.ObjectId[] {
    return this.getSchoolIdsFromRoles(roles).map(item => new mongoose.Types.ObjectId(item))
  }

  getSchoolObjectIdFromRole(role: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(role.split('school-admin-')[1])
  }

  getTownIdsFromRoles(roles: string[]): string[] {
    return roles
      .filter(role => role.includes('town-admin-'))
      .map(role => this.getIdFromRole(role))
  }

  getTownIdFromRole(role: string): string {
    return role.split('town-admin-')[1]
  }

  getTownObjectIdsFromRoles(roles: string[]): mongoose.Types.ObjectId[] {
    return this.getTownIdsFromRoles(roles).map(item => new mongoose.Types.ObjectId(item))
  }

  getTownObjectIdFromRole(role: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(this.getTownIdFromRole(role))
  }

  isAdminOfSchool(roles: string[], school_id: string): boolean {
    return roles.includes(`school-admin-${school_id}`)
  }

  isAdminOfTown(roles: string[], town_id: string): boolean {
    return roles.includes(`town-admin-${town_id}`)
  }

  getRolesWithSchool(roles: string[], school_id: string): string[] {
    roles.push(`school-admin-${school_id}`)
    return roles
  }

  getRolesWithTown(roles: string[], town_id: string): string[] {
    roles.push(`town-admin-${town_id}`)
    return roles
  }

  getRolesWithoutSchool(roles: string[], school_id: string): string[] {
    return roles.filter(role => !role.includes(`school-admin-${school_id}`))
  }

  getRolesWithoutTown(roles: string[], town_id: string): string[] {
    return roles.filter(role => !role.includes(`town-admin-${town_id}`))
  }

  isSomeAdmin(roles: string[]): boolean {
    return roles.some(role => role.split('-')[1] === 'admin')
  }

  isGlobalAdmin(roles: string[]) {
    return roles.includes('global-admin')
  }  

  isMentor(roles: string[]): boolean {
    return roles.includes('mentor')
  }

  isOwner(roles: string[]): boolean {
    return roles.includes('owner')
  }

  getType(roles: string[]): string {
    if (this.isSomeAdmin(roles))
      return 'админ'
      
    if (this.isMentor(roles))
      return 'наставник'
      
    return 'наставляемый'
  }
}
