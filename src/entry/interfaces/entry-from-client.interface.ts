import School from "src/school/interfaces/school.interface"
import Town from "src/town/interfaces/town.interface"
import { EntryType } from "src/types/entry-type.type"
import { User } from "src/user/interfaces/user.interface"

export default interface EntryFromClient {
  _id: string
  type: EntryType
  subject: string
  description: string
  author: User
  responses: string[]
  banned: string[]
  town: Town
  school: School
  date: number
  limit?: number
  on_moderation: boolean
  moderation_result?: boolean
}