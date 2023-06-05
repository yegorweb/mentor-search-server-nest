import mongoose from "mongoose"
import { User } from "../../user/interfaces/user.interface"

export interface Token {
  _id: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  refreshToken: string
}