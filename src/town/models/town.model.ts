import { MongooseModule } from "@nestjs/mongoose";
import { TownSchema } from '../schemas/town.schema'

let TownModel = MongooseModule.forFeature([{ name: 'Town', schema: TownSchema, collection: 'towns' }])
export default TownModel