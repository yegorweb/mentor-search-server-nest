import { MongooseModule } from "@nestjs/mongoose"
import { EntrySchema } from "../schemas/entry.schema"

let EntryModel = MongooseModule.forFeature([{ name: 'Entry', schema: EntrySchema, collection: 'entries' }])
export default EntryModel