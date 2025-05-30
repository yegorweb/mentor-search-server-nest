import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import School from 'src/school/interfaces/school.interface';
import { Achievement } from 'src/types/achievement.type';
import { Contact } from 'src/types/contact.type';

export type UserDocument = HydratedDocument<UserClass>

@Schema()
export class UserClass {
  @Prop({ 
    type: String, 
    required: true,
    min: 2
  })
  name: string

  @Prop({ 
    type: String, 
    required: true,
    validators: {
      validate: function(value: string) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(value)
      }
    }
  })
  email: string

  @Prop({ 
    type: String, 
    required: true,
  })
  password: string

  @Prop({
    type: String,
    max: 150
  })
  description?: string

  @Prop()
  avatar_url?: string

  @Prop({
    type: [String],
    default: []
  })
  ranks: string[]

  @Prop({
    type: [Object],
    default: []
  })
  achievements: Achievement[]

  @Prop({ 
    type: [Object],
    validators: {
      validate: function(value: Contact[]) {
        for (let item of value) {
          if (!item.name || item.name.length===0 || !item.link || item.link.length===0)
            return false
        }
        return value.length < 5
      }
    },
    default: []
  })
  contacts: Contact[]

  @Prop({ 
    type: Number, 
    required: true,
    min: 0,
    max: 11 
  })  
  grade: number

  @Prop({ 
    type: mongoose.SchemaTypes.ObjectId, 
    ref: 'School',
    required: true,
    autopopulate: true
  })
  school: School

  @Prop({ 
    type: Number, 
    required: true 
  })
  date: number

  @Prop({
    type: [String], 
    default: [],
    required: true
  })
  roles: string[]

  @Prop()
  deleted: boolean
}

export const UserSchema = SchemaFactory.createForClass(UserClass)
