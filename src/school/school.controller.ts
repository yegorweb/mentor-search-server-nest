import { Body, Controller, Get, HttpCode, HttpStatus, Next, Post, Query, Req, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { GlobalAdminGuard } from 'src/admin/global_admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import ApiError from 'src/exceptions/errors/api-error';
import { RolesService } from 'src/roles/roles.service';
import RequestWithUser from 'src/types/request-with-user.type';
import { SchoolClass } from './schemas/school.schema';

@Controller('school')
export class SchoolController {
  constructor(
    @InjectModel('School') private SchoolModel: Model<SchoolClass>,
    private RolesService: RolesService
  ) {} 

  @Get('get-by-id')
  async getById(
    @Query('_id') _id: string, 
  ) {
    let candidate = await this.SchoolModel.findById(_id)
    if (!candidate)
      throw ApiError.BadRequest('Школа с таким ID не найдена')

    return candidate
  }

  @Get('get-all')
  async getAll() {
    return await this.SchoolModel.find({})
  }

  @Get('get-all-in-town')
  async getAllInTown(
    @Query('_id') _id: string, 
  ) {
    return await this.SchoolModel.find({ town: new mongoose.Types.ObjectId(_id) })
  }

  @UseGuards(AuthGuard)
  @Get('get-administered-schools')
  async getAdministeredSchools(
    @Req() req: RequestWithUser
  ) {
    if (this.RolesService.isGlobalAdmin(req.user.roles))
      return this.SchoolModel.find({})

    return [...new Set(
      ...Array(await this.SchoolModel.find({
        _id: { $in: this.RolesService.getSchoolObjectIdsFromRoles(req.user.roles) }
      })),
      ...Array(await this.SchoolModel.find({
        town: { $in: this.RolesService.getTownObjectIdsFromRoles(req.user.roles) }
      }))
    )]
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
