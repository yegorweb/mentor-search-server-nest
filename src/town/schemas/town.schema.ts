import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TownDocument = HydratedDocument<TownClass>

@Schema()
export class TownClass {
  @Prop({ 
    type: String, 
    required: true 
  })
  name: string
}

export const TownSchema = SchemaFactory.createForClass(TownClass)