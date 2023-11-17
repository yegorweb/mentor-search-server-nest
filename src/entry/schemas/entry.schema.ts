import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AllEntryTypes } from 'src/config';
import School from 'src/school/interfaces/school.interface';
import { EntryType } from 'src/types/entry-type.type';
import { User } from 'src/user/interfaces/user.interface';

export type EntryDocument = HydratedDocument<EntryClass>

@Schema()
export class EntryClass {
  @Prop({ 
    type: String, 
    validate: {
      validator: function(value: string) {
        return AllEntryTypes.includes(value as EntryType)
      }
    },
    required: true 
  })
  type: EntryType

  @Prop({ 
    type: String, 
    required: true,
    min: 4,
    max: 32
  })
  subject: string

  @Prop({ 
    type: String, 
    required: true, 
    min: 20,
    max: 150 
  })
  description: string

  @Prop({ 
    type: mongoose.SchemaTypes.ObjectId, 
    ref: 'User',
    required: true,
    autopopulate: { select: ['name', 'avatar_url', 'ranks'] }
  })
  author: User

  @Prop([{ 
    type: mongoose.SchemaTypes.ObjectId, 
    ref: 'User',
  }])
  responses: mongoose.Types.ObjectId[]

  @Prop([{ 
    type: mongoose.SchemaTypes.ObjectId, 
    ref: 'User',
  }])
  banned: mongoose.Types.ObjectId[]

  @Prop({ 
    type: mongoose.SchemaTypes.ObjectId, 
    ref: 'School',
    required: true,
    autopopulate: true
  })
  school: School

  @Prop({ 
    type: Number,
    required: true,
    validate: {
      validator: function(value: number) {
        return value < Date.now()
      }
    }
  })
  date: number

  @Prop({
    type: Number,
    min: 1,
    max: 300
  })
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
