import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Next, Post, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import mongoose, { Model } from 'mongoose';
import { isAdmin, isAuthor, roles } from 'src/config';
import ApiError from 'src/exceptions/errors/api-error';
import EntryModel from './models/entry.model';
import { EntryClass } from './schemas/entry.schema';

@Controller('entry')
export class EntryController {
  constructor(
    @InjectModel('Entry') private EntryModel: Model<EntryClass>,
  ) {} 

  @Get('get')
  async get(@Query('town_id') town_id, @Query('school_id') school_id, @Query('type') type, @Next() next: NextFunction) {
    try {
      return await this.EntryModel.find({ 
        on_moderation: false, 
        moderation_result: true, 
        town: town_id, 
        school: school_id === 'all' 
          ? null : school_id,
        type: type 
      })
    } catch (error) {
      next(error)
    }
  }

  @Get('get-by-id')
  async get_by_id(@Query('_id') _id, @Next() next: NextFunction) {
    try {
      return await this.EntryModel.findById(_id)
    } catch (error) {
      next(error)
    }
  }

  @Get('get-by-author')
  async get_by_author(@Query('_id') _id, @Next() next: NextFunction) {
    try {
      return await this.EntryModel.find({ author: _id })
    } catch (error) {
      next(error)
    }
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async create(@Body() body, @Next() next: NextFunction) {
    try {
      if ((await this.EntryModel.find({ 
        author: body.visitor._id, 
        date: { 
          $gte: Date.now() - 1000*60*60*24, 
          $lt: Date.now() 
        } 
      })).length > 10)
        throw ApiError.BadRequest('Превышен лимит создания за день. Успокойтесь или вас удалят')
      
      let admin = isAdmin(body.visitor, body.entry)

      await this.EntryModel.create(
        Object.assign(body.entry, { 
          on_moderation: !admin, 
          moderation_result: admin ? true : null, 
          author: body.visitor._id, 
          date: Date.now() 
        })
      )
    } catch (error) {
      next(error)
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('response')
  async response(@Body() body, @Next() next: NextFunction) { // entry_id
    try {
      let entry = await this.EntryModel.findById(body.entry_id)

      if (!entry) 
        throw ApiError.BadRequest('Запись не обнаружена. Возможно, её удалили')
      if (entry.responses.length === entry.limit)
        throw ApiError.BadRequest('Вы не успели, лимит учеников уже достигнут')

      await this.EntryModel.findByIdAndUpdate(body.entry_id, { 
        $push: { 
          responses: new mongoose.Types.ObjectId(body.visitor._id) 
        } 
      })
    } catch (error) {
      next(error)
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('cancel-response')
  async cancel_response(@Body() body, @Next() next: NextFunction) {
    try {
      let entry = await this.EntryModel.findById(body.entry_id)

      if (!entry)
        throw ApiError.BadRequest('Запись не обнаружена. Возможно, её удалили')

      await this.EntryModel.findByIdAndUpdate(body.entry_id, { 
        $pull: { 
          responses: new mongoose.Types.ObjectId(body.visitor._id) 
        } 
      })
    } catch (error) {
      next(error)
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('edit')
  async edit(@Body() body, @Next() next: NextFunction) { // entry_id, entry
    try {
      let entry = await this.EntryModel.findById(body.entry_id)

      if (!entry)
        throw ApiError.BadRequest('Запись не обнаружена. Возможно, её удалили')
      if (body.visitor._id != entry.author.toString())
        throw ApiError.BadRequest('Руки прочь от чужого!')

      let admin = isAdmin(body.visitor, entry.toObject())

      await entry.updateOne(Object.assign(
        body.entry, { 
          on_moderation: !admin, 
          moderation_result: admin ? true : null 
        }
      ))
    } catch (error) {
      next(error)
    }
  }

  @HttpCode(HttpStatus.OK)
  @Delete('delete')
  async delete(@Query('entry_id') entry_id, @Body() body, @Next() next: NextFunction) { // entry_id
    try {
      let entry = await this.EntryModel.findById(entry_id)

      if (!entry)
        throw ApiError.BadRequest('Запись не обнаружена. Возможно её удалили раньше вас')

      if (isAdmin(body.visitor, entry.toObject()) || isAuthor(body.visitor, entry.toObject())) {
        await entry.deleteOne()
        return { message: 'Успешно удалено' }
      }
      else
        throw ApiError.BadRequest('Руки прочь от чужого!')
    } catch (error) {
      next(error)
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify')
  async verify(@Body() body, @Next() next: NextFunction) { // entry_id, moderation_result
    try {
      let entry = await this.EntryModel.findById(body.entry_id)
      if (!entry)
        throw ApiError.BadRequest('Запись не обнаружена. Возможно, её удалили')

      if (isAdmin(body.visitor, entry.toObject()))
        await entry.updateOne({ 
          on_moderation: false, 
          moderation_result: 
          body.moderation_result 
        })
      else
        throw ApiError.BadRequest('Руки прочь от чужого!')
    } catch (error) {
      next(error)
    }
  }

  @Get('get-entries-to-moderation')
  async get_entries_to_moderation(@Body() body, @Next() next: NextFunction) {
    try {
      if (body.visitor.roles.includes(roles.global_admin))
        return await this.EntryModel.find({ on_moderation: true })

      return await this.EntryModel.find({ 
        on_moderation: true, 
        school: { $in: body.visitor.administered_schools } 
      })
    } catch (error) {
      next(error)
    }
  }
}
