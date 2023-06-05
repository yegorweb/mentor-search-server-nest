import { MongooseModule } from "@nestjs/mongoose";
import { SchoolSchema } from "../schemas/school.schema";

let SchoolModel = MongooseModule.forFeature([{ name: 'School', schema: SchoolSchema, collection: 'schools' }])
export default SchoolModel