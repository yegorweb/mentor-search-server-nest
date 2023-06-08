import Entry from "./entry/interfaces/entry.interface"
import { User } from "./user/interfaces/user.interface"

export const roles_array = ['global-admin', 'school-admin', 'student', 'mentor'] as const

export const roles = {
  student: 'student',
  global_admin: 'global-admin',
  school_admin: 'school-admin',
  mentor: 'mentor'
} as const
