import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { SomeAdminGuard } from 'src/admin/some_admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { EntryClass } from 'src/entry/schemas/entry.schema';
import ApiError from 'src/exceptions/errors/api-error';
import { RolesService } from 'src/roles/roles.service';
import { SchoolClass } from 'src/school/schemas/school.schema';
import { SchoolService } from 'src/school/school.service';
import { TownClass } from 'src/town/schemas/town.schema';
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
  @UseGuards(SomeAdminGuard)
  @Post('change-user')
  async changeUser(
    @Req() req: RequestWithUser,
    @Body('user') user: UserFromClient
  ) {
    if (!this.UserService.hasAccess(req.user.roles, user))
      throw ApiError.AccessDenied()

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

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('have-i-access-to-role')
  async haveIAccessToRole(
    @Req() req: RequestWithUser,
    @Query('role') role: string
  ): Promise<boolean> {
    return await this.UserService.hasAccessToRole(req.user.roles, role)
  }

  @UseGuards(SomeAdminGuard)
  @Get('get-roles')
  async getRoles(
    @Req() req: RequestWithUser,
    @Query('user_id') user_id: string
  ) {
    let user = await this.UserModel.findById(user_id)
    let result = []
    for (let role in user.roles) {
      if (this.RolesService.isOwner([role])) {
        result.push({
          role,
          name: 'Владелец',
          have_access: false
        })
        break
      }
      if (this.RolesService.isGlobalAdmin([role])) {
        result.push({
          role,
          name: 'Глобальный администратор',
          have_access: this.RolesService.isOwner(req.user.roles)
        })
        break
      }
      if (this.RolesService.getTownIdsFromRoles([role]).length) {
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
      if (this.RolesService.getSchoolIdsFromRoles([role]).length) {
        let _id = this.RolesService.getIdFromRole(role)
        let school = await this.SchoolModel.findById(_id)
        if (!school) break

        result.push({
          role,
          name: `Админ ОУ «${school.name}»`,
          have_access: (
            this.RolesService.isGlobalAdmin(req.user.roles) || 
            this.RolesService.getTownIdsFromRoles(req.user.roles).includes(school.town._id.toString())
          )
        })
        break
      }
    }
  }
}
