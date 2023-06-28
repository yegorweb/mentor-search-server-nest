import { Body, Controller, Get, HttpCode, HttpStatus, Next, Post, Query, Req, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AuthGuard } from 'src/auth/auth.guard';
import { roles } from 'src/config';
import { EntryClass } from 'src/entry/schemas/entry.schema';
import ApiError from 'src/exceptions/errors/api-error';
import { RolesService } from 'src/roles/roles.service';
import { SchoolClass } from 'src/school/schemas/school.schema';
import { SchoolService } from 'src/school/school.service';
import RequestWithUser from 'src/types/request-with-user.type';
import { UserFromClient } from './interfaces/user-from-client.interface';
import { UserClass } from './schemas/user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    @InjectModel('User') private UserModel: Model<UserClass>,
    @InjectModel('Entry') private EntryModel: Model<EntryClass>,
    @InjectModel('School') private SchoolModel: Model<SchoolClass>,
    private RolesService: RolesService,
    private UserService: UserService,
    private SchoolService: SchoolService
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
    @Query('_id') school_id: string, 
  ) {
    let school = await this.SchoolModel.findById(school_id)
    
    if (!school)
      throw ApiError.BadRequest('Школа не найдена')

    if (!this.SchoolService.hasAccess(req.user.roles, school_id, school.town._id.toString()))
      throw ApiError.AccessDenied()

    return await this.UserModel.find({ 
      school: school._id 
    })
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Post('change-user')
  async changeUser(
    @Req() req: RequestWithUser,
    @Body('user') user: UserFromClient
  ) {
    if (!this.UserService.hasAccess(req.user.roles, user))
      throw ApiError.AccessDenied()

    await this.UserModel.findByIdAndUpdate(user._id, {
      roles: user.roles,
      achievements: user.achievements,
      ranks: user.ranks
    })
  }
}
