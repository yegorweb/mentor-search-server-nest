import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import School from 'src/school/interfaces/school.interface';
import Town from 'src/town/interfaces/town.interface';
import { Achievement } from 'src/types/achievement.type';
import { Answer } from 'src/types/answer.type';
import { Contact } from 'src/types/contact.type';
import { Roles } from 'src/types/role.type';

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
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)
      }
    }
  })
  email: string

  @Prop({ 
    type: String, 
    required: true,
    min: 8,
    max: 30
  })
  password: string

  @Prop({
    type: String,
    max: 150
  })
  description?: string

  @Prop()
  avatar_url?: string

  @Prop()
  ranks?: string[]

  @Prop({
    type: [Object]
  })
  achievements?: Achievement[]

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
    }
  })
  contacts?: Contact[]

  @Prop({ 
    type: Number, 
    required: true,
    min: 0,
    max: 11 
  })  
  grade: number

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

  @Prop([{ 
    type: mongoose.Types.ObjectId, 
    ref: 'School',
  }])
  administered_schools: mongoose.Types.ObjectId[]

  @Prop({ 
    type: Number, 
    required: true 
  })
  date?: number

  @Prop({
    type: Array, 
    default: ['student'],
    required: true
  })
  roles: Roles
}

export const UserSchema = SchemaFactory.createForClass(UserClass)