import { Body, Controller, Get, HttpCode, HttpStatus, Next, Post, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import { Model } from 'mongoose';
import ApiError from 'src/exceptions/errors/api-error';
import SchoolModel from './models/school.model';
import { SchoolClass } from './schemas/school.schema';

@Controller('school')
export class SchoolController {
  constructor(
    @InjectModel('School') private SchoolModel: Model<SchoolClass>,
  ) {} 

  @Get('get-by-id')
  async get_by_id(@Query('_id') _id, @Next() next: NextFunction) {
    try {
      let candidate = await this.SchoolModel.findById(_id)
      if (!candidate) {
        throw ApiError.BadRequest('Школа с таким ID не найдена')
      }
    } catch(error) {
      next(error)
    }
  }

  @Get('get-all')
  async get_all(@Next() next: NextFunction) {
    try {
      return await this.SchoolModel.find({})
    } catch(error) {
      next(error)
    }      
  }

  @Get('get-all-in-town')
  async get_all_in_town(@Query('_id') _id, @Next() next: NextFunction) {
    try {
      return await this.SchoolModel.find({ town: _id })
    } catch(error) {
      next(error)
    }      
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async create(@Body() body, @Next() next: NextFunction) {
    try {
      await this.SchoolModel.create({ name: body.name, date: Date.now() })
    } catch (error) {
      next(error)
    }
  }
}
