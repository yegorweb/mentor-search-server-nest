import mongoose from "mongoose"
import School from "src/school/interfaces/school.interface"
import { EntryType } from "src/types/entry-type.type"
import { User } from "src/user/interfaces/user.interface"

export default interface Entry {
  _id: mongoose.Types.ObjectId
  type: EntryType
  subject: string
  description: string
  author: User
  responses: mongoose.Types.ObjectId[]
  banned: mongoose.Types.ObjectId[]
  school: School
  date: number
  limit?: number
  on_moderation: boolean
  moderation_result?: boolean
}