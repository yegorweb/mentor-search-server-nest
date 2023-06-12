import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import mongoose, { Model } from 'mongoose';
import { AuthGuard } from 'src/auth/auth.guard';
import ApiError from 'src/exceptions/errors/api-error';
import RequestWithUser from 'src/types/request-with-user.type';
import { EntryService } from './entry.service';
import Entry from './interfaces/entry.interface';
import { EntryClass } from './schemas/entry.schema';
import isGlobalAdmin from 'src/admin/functions/is-global-admin.function';
import { EntryType } from 'src/types/entry-type.type';

@Controller('entry')
export class EntryController {
  constructor(
    @InjectModel('Entry') private EntryModel: Model<EntryClass>,
    private EntryService: EntryService
  ) {} 

  @Get('get')
  async get(
    @Query('town_id') town_id: string, 
    @Query('school_id') school_id: string, 
    @Query('type') type: EntryType, 
  ) {
    return await this.EntryModel.find({ 
      on_moderation: false, 
      moderation_result: true, 
      town: town_id, 
      school: school_id === 'all' 
        ? null : school_id,
      type: type 
    })
  }

  @Get('get-by-id')
  async get_by_id(
    @Query('_id') _id: string, 
  ) {
    return await this.EntryModel.findById(_id)
  }

  @Get('get-by-author')
  async get_by_author(
    @Query('_id') _id: string, 
  ) {
    return await this.EntryModel.find({ author: _id })
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async create(
    @Req() req: RequestWithUser, 
    @Body('entry') entry: Entry, 
  ) {
    if ((await this.EntryModel.find({ 
      author: req.user._id, 
      date: { 
        $gte: Date.now() - 1000*60*60*24, 
        $lt: Date.now() 
      } 
    })).length > 10)
      throw ApiError.BadRequest('Превышен лимит создания за день. Успокойтесь или вас удалят')
    
    let admin = this.EntryService.isAdmin(req.user, entry)

    return await this.EntryModel.create(
      Object.assign(entry, { 
        on_moderation: !admin, 
        moderation_result: admin ? true : null, 
        author: req.user._id, 
        date: Date.now() 
      })
    )
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('response')
  async response(
    @Req() req: RequestWithUser, 
    @Body('entry_id') entry_id: string, 
  ) {
    let entry = await this.EntryModel.findById(entry_id)

    if (!entry) 
      throw ApiError.BadRequest('Запись не обнаружена. Возможно, её удалили')
    if (entry.responses.length === entry.limit)
      throw ApiError.BadRequest('Вы не успели, лимит учеников уже достигнут')

    await this.EntryModel.findByIdAndUpdate(entry_id, { 
      $push: { 
        responses: new mongoose.Types.ObjectId(req.user._id) 
      } 
    })
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('cancel-response')
  async cancel_response(
    @Req() req: RequestWithUser, 
    @Body('entry_id') entry_id: string, 
  ) {
    let entry = await this.EntryModel.findById(entry_id)

    if (!entry)
      throw ApiError.BadRequest('Запись не обнаружена. Возможно, её удалили')

    await this.EntryModel.findByIdAndUpdate(entry_id, { 
      $pull: { 
        responses: new mongoose.Types.ObjectId(req.user._id) 
      } 
    })
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('edit')
  async edit(
    @Req() req: RequestWithUser, 
    @Body('entry_id') entry_id: string, 
    @Body('entry') new_entry: Entry, 
  ) {
    let entry = await this.EntryModel.findById(entry_id)

    if (!entry)
      throw ApiError.BadRequest('Запись не обнаружена. Возможно, её удалили')
    if (req.user._id !== entry.author.toString())
      throw ApiError.BadRequest('Руки прочь от чужого!')

    let admin = this.EntryService.isAdmin(req.user, entry)

    await entry.updateOne(Object.assign(
      new_entry, { 
        on_moderation: !admin, 
        moderation_result: admin ? true : null 
      }
    ))
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('delete')
  async delete(
    @Req() req: RequestWithUser, 
    @Query('entry_id') entry_id: string, 
  ) {
    let entry = await this.EntryModel.findById(entry_id)

    if (!entry)
      throw ApiError.BadRequest('Запись не обнаружена. Возможно её удалили раньше вас')

    if (this.EntryService.isAdmin(req.user, entry) || this.EntryService.isAuthor(req.user, entry)) {
      await entry.deleteOne()
      return { message: 'Успешно удалено' }
    }
    else
      throw ApiError.BadRequest('Руки прочь от чужого!')
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  async verify(
    @Req() req: RequestWithUser, 
    @Body('entry_id') entry_id: string, 
    @Body('moderation_result') moderation_result: boolean, 
  ) {
    let entry = await this.EntryModel.findById(entry_id)
    if (!entry)
      throw ApiError.BadRequest('Запись не обнаружена. Возможно, её удалили')

    if (this.EntryService.isAdmin(req.user, entry))
      await entry.updateOne({ 
        on_moderation: false, 
        moderation_result 
      })
    else
      throw ApiError.BadRequest('Руки прочь от чужого!')
  }

  @UseGuards(AuthGuard)
  @Get('get-entries-to-moderation')
  async get_entries_to_moderation(
    @Req() req: RequestWithUser, 
  ) {
    if (isGlobalAdmin(req.user))
      return await this.EntryModel.find({ on_moderation: true })

    return await this.EntryModel.find({ 
      on_moderation: true, 
      school: { $in: req.user.administered_schools } 
    })
  }
}
