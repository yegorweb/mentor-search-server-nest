import { Controller, Get, Next, Query, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import mongoose, { Model } from 'mongoose';
import { EntryClass } from 'src/entry/schemas/entry.schema';
import ApiError from 'src/exceptions/errors/api-error';
import RequestWithUser from 'src/types/request-with-user.type';
import { UserClass } from './schemas/user.schema';

@Controller('user')
export class UserController {
  constructor(
    @InjectModel('User') private UserModel: Model<UserClass>,
    @InjectModel('Entry') private EntryModel: Model<EntryClass>
  ) {} 

  @Get('get-by-id')
  async get_by_id(@Query('_id') _id: string, @Next() next: NextFunction) {
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
  async get_my_responses(@Req() req: RequestWithUser, @Next() next: NextFunction) {
    try {
      return await this.EntryModel.find({ 
        responses: new mongoose.Types.ObjectId(req.user._id) 
      })
    } catch(error) {
      next(error)
    }      
  }

  @Get('get-all-by-school')
  async get_all_by_school(@Req() req: RequestWithUser, @Query('_id') _id, @Next() next: NextFunction) { // _id
    try {
      if ((req.user.roles.includes('school-admin') && req.user.administered_schools.includes(_id)) ||
      req.user.roles.includes('global-admin'))
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
