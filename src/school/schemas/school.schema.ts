import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import Town from 'src/town/interfaces/town.interface';

export type SchoolDocument = HydratedDocument<SchoolClass>

@Schema()
export class SchoolClass {
  @Prop({ 
    type: String, 
    required: true,
    min: 2,
    max: 30 
  })
  name: string
  
  @Prop({ 
    type: mongoose.Types.ObjectId, 
    ref: 'Town', 
    required: true,
    autopopulate: true
  })
  town: Town
}

export const SchoolSchema = SchemaFactory.createForClass(SchoolClass)