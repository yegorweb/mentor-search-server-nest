import mongoose from "mongoose"

export default interface Town {
  _id: mongoose.Types.ObjectId
  name: string
}