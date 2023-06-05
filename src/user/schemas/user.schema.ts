import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import School from 'src/school/interfaces/school.interface';
import Town from 'src/town/interfaces/town.interface';
import { Achievement } from 'src/types/achievement.type';
import { Answer } from 'src/types/answer.type';
import { Contact } from 'src/types/contact.type';
import { Roles } from 'src/types/role.type';

export type UserDocument = HydratedDocument<UserClass>

@Schema()//{ collection: 'User' })
export class UserClass {
  @Prop({ 
    type: String, 
    required: true 
  })
  name: string

  @Prop({ 
    type: String, 
    required: true 
  })
  email: string

  @Prop({ 
    type: String, 
    required: true 
  })
  password: string

  @Prop()
  description?: string

  @Prop()
  avatar_url?: string

  @Prop({ 
    type: Array<String>, 
    default: [] 
  })
  ranks: string[]

  @Prop({ 
    type: Array, 
    default: [] 
  })
  achievements: Achievement[]

  @Prop({ 
    type: [Object]
  })
  answers?: Answer[]

  @Prop({ 
    type: [Object], 
    default: [] 
  })  
  contacts: Contact[]

  @Prop({ 
    type: Number, 
    required: true 
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

  @Prop({ 
    type: mongoose.Types.ObjectId, 
    ref: 'School',
    autopopulate: true
  })
  administered_schools: School[]

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