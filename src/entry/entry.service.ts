import { Injectable } from '@nestjs/common';
import { roles } from 'src/config';
import SchoolFromClient from 'src/school/interfaces/school-from-client.interface';
import School from 'src/school/interfaces/school.interface';
import TownFromClient from 'src/town/interfaces/town-from-client.interface';
import Town from 'src/town/interfaces/town.interface';
import Entry from './interfaces/entry.interface';

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

  filter(entries: Entry[], user: any, town_id: string, school_id: string) {
    return entries.filter(entry => 
      (
        !entry.responses.includes(user._id) &&
        !entry.banned.includes(user._id) &&
        entry.author._id !== user._id
      ) 
        && 
      (
        entry.school._id.toString() == school_id || 
        (entry.town._id.toString() === town_id && school_id === 'all')
      )
    )      
  }
}
