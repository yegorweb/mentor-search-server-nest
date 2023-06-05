import mongoose from "mongoose"
import Town from "src/town/interfaces/town.interface"

export default interface School {
  _id: mongoose.Types.ObjectId
  name: string
  town: Town
}