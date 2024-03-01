import { Body, Controller, Get, HttpCode, HttpStatus, ParseFilePipeBuilder, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import mongoose, { Model } from 'mongoose';
import { SomeAdminGuard } from 'src/admin/some_admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { EntryClass } from 'src/entry/schemas/entry.schema';
import ApiError from 'src/exceptions/errors/api-error';
import { RolesService } from 'src/roles/roles.service';
import { s3 } from 'src/s3/bucket';
import { SchoolClass } from 'src/school/schemas/school.schema';
import { SchoolService } from 'src/school/school.service';
import { TownClass } from 'src/town/schemas/town.schema';
import RequestWithUser from 'src/types/request-with-user.type';
import { UserFromClient } from './interfaces/user-from-client.interface';
import { UserClass } from './schemas/user.schema';
import { UserService } from './user.service';
import { v4 as uuidv4 } from 'uuid';
import { ManagedUpload } from 'aws-sdk/clients/s3';

@Controller('user')
export class UserController {
  constructor(
    @InjectModel('User') private UserModel: Model<UserClass>,
    @InjectModel('Entry') private EntryModel: Model<EntryClass>,
    @InjectModel('School') private SchoolModel: Model<SchoolClass>,
    @InjectModel('Town') private TownModel: Model<TownClass>,
    private UserService: UserService,
    private SchoolService: SchoolService,
    private RolesService: RolesService
  ) {} 

  @Get('get-by-id')
  async get_by_id(
    @Query('_id') _id: string, 
  ) {
    let candidate = await this.UserModel.findById(_id, { password: 0 })
    if (!candidate)
      throw ApiError.BadRequest('Пользователь с таким ID не найден')

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

  @UseGuards(SomeAdminGuard)
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
  @UseInterceptors(FileInterceptor('image'))
  @Post('upload-avatar')
  async uploadAvatar(
    @Req() req: RequestWithUser,
    @UploadedFile(new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: 'jpeg',
      })
      .addMaxSizeValidator({
        maxSize: 200,
        message: 'Превышен максимальный размер 200х200'
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    ) file: Express.Multer.File
  ) {
    let id = uuidv4()

    let upload = await s3.Upload({
      name: `${id}.jpg`,
      buffer: file.buffer
    }, '/') as ManagedUpload.SendData

    if (!upload)
      throw ApiError.BadRequest('Ошибка на сервере. Сообщите о ней')
    
    let previos_avatar = req.user.avatar_url
    await this.UserModel.findByIdAndUpdate(req.user._id, { $set: { avatar_url: upload.Location } })

    if (previos_avatar) {
      try {
        s3.Remove('/' + previos_avatar.split('/').pop())
      } catch {}
    }
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(SomeAdminGuard)
  @Post('change-user')
  async changeUser(
    @Req() req: RequestWithUser,
    @Body('user') user: UserFromClient
  ) {
    let subject_user = await this.UserModel.findById(user._id)
    
    await this.UserService.checkAccessToRoles(
      req.user.roles,
      subject_user.roles,
      user.roles
    )

    await subject_user.updateOne({
      roles: user.roles,
      achievements: user.achievements,
      ranks: user.ranks
    }, { runValidators: true })
  }

  @UseGuards(SomeAdminGuard)
  @Get('get-roles')
  async getRoles(
    @Req() req: RequestWithUser,
    @Query('user_id') user_id: string
  ) {
    let user = await this.UserModel.findById(user_id)
    let result: {
      role: string,
      name: string,
      have_access: boolean
    }[] = []

    for (const role of user.roles) {
      console.log(role)
      if (this.RolesService.isOwner([role])) {
        result.push({
          role,
          name: 'Владелец',
          have_access: false
        })
        break
      }
      else if (this.RolesService.isGlobalAdmin([role])) {
        result.push({
          role,
          name: 'Глобальный администратор',
          have_access: this.RolesService.isOwner(req.user.roles)
        })
        break
      }
      else if (this.RolesService.getTownIdsFromRoles([role]).length) {
        let _id = this.RolesService.getIdFromRole(role)
        let town = await this.TownModel.findById(_id)
        if (!town) break

        result.push({
          role,
          name: `Админ города «${town.name}»`,
          have_access: this.RolesService.isGlobalAdmin(req.user.roles)
        })
        break
      }
      else if (this.RolesService.getSchoolIdsFromRoles([role]).length) {
        let _id = this.RolesService.getIdFromRole(role)
        let school = await this.SchoolModel.findById(_id)
        if (!school) break

        result.push({
          role,
          name: `Админ ОУ «${school.name}»`,
          have_access: await this.UserService.hasAccessToPullRole(req.user.roles, role)
        })
        break
      }
    }
    return result
  }
}
