import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import EntryModel from 'src/entry/models/entry.model';
import { EntryClass, EntrySchema } from 'src/entry/schemas/entry.schema';
import UserModel from './models/user.model';
import { UserClass, UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';

@Module({
  imports: [
    UserModel,
    EntryModel
  ],
  controllers: [UserController]
})
export class UserModule {}
