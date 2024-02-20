import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AuthGuard } from 'src/auth/auth.guard';
import ApiError from 'src/exceptions/errors/api-error';
import RequestWithUser from 'src/types/request-with-user.type';
import { EntryService } from './entry.service';
import Entry from './interfaces/entry.interface';
import { EntryClass } from './schemas/entry.schema';
import { EntryType } from 'src/types/entry-type.type';
import { TryToGetUser } from 'src/auth/try-to-get-user.guard';
import RequestWithUserOrNot from 'src/types/request-with-user-or-not.type';
import { RolesService } from 'src/roles/roles.service';

@Controller('entry')
export class EntryController {
  constructor(
    @InjectModel('Entry') private EntryModel: Model<EntryClass>,
    private EntryService: EntryService,
    private RolesService: RolesService
  ) {} 

  @UseGuards(TryToGetUser)
  @Get('get')
  async get(
    @Req() req: RequestWithUserOrNot,
    @Query('type') type: EntryType, 
    @Query('school_id') school_id: string, 
    @Query('town_id') town_id: string, 
  ) {
    let query: any = {
      type,
      on_moderation: false,
      moderation_result: true,
      town: new mongoose.Types.ObjectId(town_id),
    }
    school_id === 'all' ? null : 
      query.school = new mongoose.Types.ObjectId(school_id)

    if (req.user) {
      query = Object.assign(query, {
        responses: {
          $not: {
            $in: [new mongoose.Types.ObjectId(req.user._id)]
          }
        },
        banned: {
          $not: {
            $in: [new mongoose.Types.ObjectId(req.user._id)]
          }
        },
        author: {
          $ne: new mongoose.Types.ObjectId(req.user._id) 
        }
      })
    }

    return await this.EntryModel.find(query, { subject: 1 , description: 1, author: 1, responses: 1, school: 1, limit: 1 })
  }

  @Get('get-by-id')
  async get_by_id(
    @Query('_id') _id: string, 
  ) {
    return await this.EntryModel.findById(_id)
  }

  @UseGuards(TryToGetUser)
  @Get('get-by-author')
  async get_by_author(
    @Req() req: RequestWithUserOrNot,
    @Query('_id') _id: string, 
  ) {
    let query: any = {
      author: new mongoose.Types.ObjectId(_id)
    }
    if (req.user) {
      query.banned = {
        $not: {
          $in: [new mongoose.Types.ObjectId(req.user._id)]
        }
      }  
    }

    return await this.EntryModel.find(query, { type: 1, subject: 1 , description: 1, responses: 1, school: 1, limit: 1 })
  }

  @UseGuards(AuthGuard)
  @Get('get-my-entries')
  async get_my_entries(
    @Req() req: RequestWithUser
  ) {
    return await this.EntryModel.find({
      author: new mongoose.Types.ObjectId(req.user._id)
    }, { date: 0, banned: 0 })
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async create(
    @Req() req: RequestWithUser, 
    @Body('entry') entry: Entry, 
  ) {
    this.EntryService.checkLimit(req.user)
    
    let admin = await this.EntryService.beforeCreateIsAdmin(req.user.roles, entry)

    return await this.EntryModel.create(
      Object.assign(entry, { 
        on_moderation: !admin, 
        moderation_result: admin ? true : null, 
        author: new mongoose.Types.ObjectId(req.user._id), 
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
    if (entry.author._id.toString() == req.user._id)
      throw ApiError.BadRequest('Нельзя откликаться на свои записи')
    if (entry.limit && entry.responses.length >= entry.limit)
      throw ApiError.BadRequest('Вы не успели, лимит учеников уже достигнут')

    await entry.updateOne({ 
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

    await entry.updateOne({ 
      $pull: { 
        responses: new mongoose.Types.ObjectId(req.user._id) 
      } 
    })
  }

  @UseGuards(AuthGuard)
  @Get('get-responses')
  async getResponses(
    @Req() req: RequestWithUser,
    @Query('entry_id') entry_id: string
  ) {
    return (await this.EntryModel.findById(entry_id).populate({ path: 'responses', select: ['name', 'avatar_url', 'ranks'] })).responses
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
    if (req.user._id !== entry.author._id.toString())
      throw ApiError.AccessDenied()

    let admin = this.EntryService.isAdmin(req.user.roles, entry)

    await entry.updateOne(Object.assign(
      new_entry, { 
        on_moderation: !admin, 
        moderation_result: admin ? true : null 
      }
    ), { runValidators: true })

    return { message: 'Отредактировано' }
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

    if (!this.EntryService.isAdmin(req.user.roles, entry) && !this.EntryService.isAuthor(req.user, entry))
      throw ApiError.AccessDenied()

    await entry.deleteOne()
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

    if (!this.EntryService.isAdmin(req.user.roles, entry))
      throw ApiError.AccessDenied()
    
    await entry.updateOne({ 
      on_moderation: false, 
      moderation_result 
    })
  }

  @UseGuards(AuthGuard)
  @Get('get-entries-to-moderation')
  async get_entries_to_moderation(
    @Req() req: RequestWithUser, 
  ) {
    if (this.RolesService.isGlobalAdmin(req.user.roles))
      return await this.EntryModel.find({ on_moderation: true })

    return await this.EntryModel.find({ 
      on_moderation: true, 
      school: { 
        $in: this.RolesService.getSchoolObjectIdsFromRoles(req.user.roles) 
      },
      town: {
        $in: this.RolesService.getTownObjectIdsFromRoles(req.user.roles)
      }
    })
  }
}

