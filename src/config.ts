import Entry from "./entry/interfaces/entry.interface"
import { User } from "./user/interfaces/user.interface"

export const roles_array = ['global-admin', 'school-admin', 'student', 'mentor'] as const

export const roles = {
  student: 'student',
  global_admin: 'global-admin',
  school_admin: 'school-admin',
  mentor: 'mentor'
} as const

export function isAdmin(user: User, document: Entry): boolean {
  return (
    user.roles.includes(roles.school_admin) && 
    user.administered_schools.some(item => item._id == document.school._id)
  ) || user.roles.includes(roles.global_admin)
}

export function isAuthor(user: User, document: Entry): boolean {
  return user._id == document.author._id
}