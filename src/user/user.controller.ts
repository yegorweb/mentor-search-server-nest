import { Controller, Get, Next, Query, Req, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import mongoose, { Model } from 'mongoose';
import isGlobalAdmin from 'src/admin/functions/is-global-admin.function';
import { AuthGuard } from 'src/auth/auth.guard';
import { roles } from 'src/config';
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
  async get_by_id(
    @Query('_id') _id: string, 
  ) {
    let candidate = await this.UserModel.findById(_id)
    if (!candidate) {
      throw ApiError.BadRequest('Пользователь с таким ID не найден')
    }

    delete candidate.password

    return candidate
  }

  @UseGuards(AuthGuard)
  @Get('get-my-responses')
  async get_my_responses(
    @Req() req: RequestWithUser, 
  ) {
    return await this.EntryModel.find({ 
      responses: new mongoose.Types.ObjectId(req.user._id) 
    })
  }

  @UseGuards(AuthGuard)
  @Get('get-all-by-school')
  async get_all_by_school(
    @Req() req: RequestWithUser, 
    @Query('_id') _id: string, 
  ) {
    if ((req.user.roles.includes(roles.school_admin) && req.user.administered_schools.includes(_id)) ||
    isGlobalAdmin(req.user))
      return await this.UserModel.find({ 
        school: new mongoose.Types.ObjectId(_id) 
      })
    else
      throw ApiError.BadRequest('Вы не администратор этой школы')
  }
}
