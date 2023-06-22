import mongoose from "mongoose"
import School from "src/school/interfaces/school.interface"
import Town from "src/town/interfaces/town.interface"
import { Achievement } from "src/types/achievement.type"
import { Answer } from "src/types/answer.type"
import { Contact } from "src/types/contact.type"
import { Roles } from "src/types/role.type"

export interface User {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password: string
  description?: string
  avatar_url?: string
  ranks: string[]
  achievements: Achievement[]
  answers?: Answer[]
  contacts: Contact[]
  grade: number
  town: Town
  school: School
  date: number
  roles: Roles
}
