import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import School from 'src/school/interfaces/school.interface';
import Town from 'src/town/interfaces/town.interface';
import { EntryType } from 'src/types/entry-type.type';
import { User } from 'src/user/interfaces/user.interface';

export type EntryDocument = HydratedDocument<EntryClass>

@Schema()
export class EntryClass {
  @Prop({ 
    type: String, 
    required: true 
  })
  type: EntryType

  @Prop({ 
    type: String, 
    required: true 
  })
  subject: string

  @Prop({ 
    type: String, 
    required: true 
  })
  description: string

  @Prop({ 
    type: mongoose.Types.ObjectId, 
    ref: 'User',
    required: true,
    autopopulate: true
  })
  author: User

  @Prop({ 
    type: [{ 
      type: mongoose.Types.ObjectId, 
      ref: 'User'
    }], 
    required: true 
  })
  responses: mongoose.Types.ObjectId[]

  @Prop({ 
    type: [{ 
      type: mongoose.Types.ObjectId, 
      ref: 'User'
    }], 
    required: true 
  })
  banned: mongoose.Types.ObjectId[]

  @Prop({ 
    type: mongoose.Types.ObjectId, 
    ref: 'Town',
    required: true,
    autopopulate: true
  })
  town: Town

  @Prop({ 
    type: mongoose.Types.ObjectId, 
    ref: 'School',
    required: true,
    autopopulate: true
  })
  school: School

  @Prop({ 
    type: Number,
    required: true,
  })
  date: number

  @Prop()
  limit: number

  @Prop({ 
    type: Boolean,
    required: true
  })
  on_moderation: boolean

  @Prop()
  moderation_result: boolean
}

export const EntrySchema = SchemaFactory.createForClass(EntryClass)