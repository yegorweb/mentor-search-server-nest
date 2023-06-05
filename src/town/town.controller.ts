import { Body, Controller, Get, HttpCode, HttpStatus, Next, Post, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import { Model } from 'mongoose';
import ApiError from 'src/exceptions/errors/api-error';
import TownModel from './models/town.model';
import { TownClass } from './schemas/town.schema';

@Controller('town')
export class TownController {
  constructor(
    @InjectModel('Town') private TownModel: Model<TownClass>,
  ) {} 

  @Get('all')
  async all(@Next() next: NextFunction) {
    try {
      return await this.TownModel.find({})
    } catch(error) {
      next(error)
    }
  }

  @Get('get-by-id')
  async get_by_id(@Query('_id') _id, @Next() next: NextFunction) {
    try {
      let candidate = this.TownModel.findById(_id)
      if (!candidate) {
        throw ApiError.BadRequest('Город с таким ID не найден')
      }
      
      return candidate
    } catch(error) {
      next(error)
    }      
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async create(@Body() body, @Next() next: NextFunction) {
    try {
      await this.TownModel.create({ name: body.name })
    } catch (error) {
      next(error)
    }
  }
}
