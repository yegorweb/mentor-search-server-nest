import { Injectable } from '@nestjs/common';
import { roles } from 'src/config';

@Injectable()
export class EntryService {
  isAdmin(user, document): boolean {
    return (
      user.roles.includes(roles.school_admin) && 
      user.administered_schools.some(item => item._id == document.school._id)
    ) || user.roles.includes(roles.global_admin)
  }
  
  isAuthor(user, document): boolean {
    return user._id == document.author._id
  }
}
