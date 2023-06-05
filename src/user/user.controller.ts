import { Body, Controller, Get, Next, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import mongoose, { Model } from 'mongoose';
import EntryModel from 'src/entry/models/entry.model';
import { EntryClass } from 'src/entry/schemas/entry.schema';
import ApiError from 'src/exceptions/errors/api-error';
import UserModel from './models/user.model';
import { UserClass } from './schemas/user.schema';

@Controller('user')
export class UserController {
  constructor(
    @InjectModel('User') private UserModel: Model<UserClass>,
    @InjectModel('Entry') private EntryModel: Model<EntryClass>
  ) {} 

  @Get('get-by-id')
  async get_by_id(@Query('_id') _id, @Next() next: NextFunction) {
    try {
      let candidate = await this.UserModel.findById(_id)
      if (!candidate) {
        throw ApiError.BadRequest('Пользователь с таким ID не найден')
      }

      delete candidate.password
      
      return candidate
    } catch(error) {
      next(error)
    }
  }

  @Get('get-my-responses')
  async get_my_responses(@Body() body, @Next() next: NextFunction) {
    try {
      return await this.EntryModel.find({ 
        responses: new mongoose.Types.ObjectId(body.visitor._id) 
      })
    } catch(error) {
      next(error)
    }      
  }

  @Get('get-all-by-school')
  async get_all_by_school(@Body() body, @Query('_id') _id, @Next() next: NextFunction) { // _id
    try {
      if ((body.visitor.roles.includes('school-admin') && body.visitor.administered_schools.includes(_id)) ||
      body.visitor.roles.includes('global-admin'))
        return await this.UserModel.find({ 
          school: new mongoose.Types.ObjectId(_id) 
        })
      else
        throw ApiError.BadRequest('Вы не администратор этой школы')
    } catch(error) {
      next(error)
    }      
  }
}
