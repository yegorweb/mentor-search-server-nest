import { Injectable } from '@nestjs/common';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class SchoolService {
  constructor(
    private RolesService: RolesService
  ) {}

  hasAccess(roles: string[], school_id: string, town_id: string): boolean {
    return this.RolesService.isAdminOfSchool(roles, school_id) ||
           this.RolesService.isAdminOfTown(roles, town_id) ||
           this.RolesService.isGlobalAdmin(roles)
  }
}
