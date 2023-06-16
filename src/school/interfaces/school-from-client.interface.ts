import Town from "src/town/interfaces/town.interface"

export default interface SchoolFromClient {
  _id: string
  name: string
  town: Town
}