import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class RolesService {
  getIdFromRole(role: string): string {
    return role.split('-')[2]
  }

  getSchoolIdsFromRoles(roles: string[]): string[] {
    return roles
      .filter(item => item.includes('school-admin-'))
      .map(item => item.split('school-admin-')[1])
  }

  getSchoolObjectIdsFromRoles(roles: string[]): mongoose.Types.ObjectId[] {
    return this.getSchoolIdsFromRoles(roles).map(item => new mongoose.Types.ObjectId(item))
  }

  getTownIdsFromRoles(roles: string[]): string[] {
    return roles
      .filter(item => item.includes('town-admin-'))
      .map(item => item.split('town-admin-')[1])
  }

  getTownObjectIdsFromRoles(roles: string[]): mongoose.Types.ObjectId[] {
    return this.getTownIdsFromRoles(roles).map(item => new mongoose.Types.ObjectId(item))
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
    return roles.filter(item => !item.includes(`school-admin-${school_id}`))
  }

  getRolesWithoutTown(roles: string[], town_id: string): string[] {
    return roles.filter(item => !item.includes(`town-admin-${town_id}`))
  }

  isSomeAdmin(roles: string[]): boolean {
    return roles.some(item => item.includes('school-admin-') || item.includes('town-admin-'))
  }

  isGlobalAdmin(roles: string[]) {
    return roles.includes('global-admin')
  }  
}
