import { Body, Controller, Get, HttpCode, HttpStatus, Next, Post, Query, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { GlobalAdminGuard } from 'src/admin/global_admin.guard';
import ApiError from 'src/exceptions/errors/api-error';
import { SchoolClass } from './schemas/school.schema';

@Controller('school')
export class SchoolController {
  constructor(
    @InjectModel('School') private SchoolModel: Model<SchoolClass>,
  ) {} 

  @Get('get-by-id')
  async get_by_id(
    @Query('_id') _id: string, 
  ) {
    let candidate = await this.SchoolModel.findById(_id)
    if (!candidate) {
      throw ApiError.BadRequest('Школа с таким ID не найдена')
    }
  }

  @Get('get-all')
  async get_all() {
    return await this.SchoolModel.find({})
  }

  @Get('get-all-in-town')
  async get_all_in_town(
    @Query('_id') _id: string, 
  ) {
    return await this.SchoolModel.find({ town: new mongoose.Types.ObjectId(_id) })
  }

  @UseGuards(GlobalAdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async create(
    @Body('name') name: string, 
  ) {
    await this.SchoolModel.create({ name, date: Date.now() })
  }
}
