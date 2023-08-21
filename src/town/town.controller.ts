import { Body, Controller, Get, HttpCode, HttpStatus, Next, Post, Query, Req, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalAdminGuard } from 'src/admin/global_admin.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import ApiError from 'src/exceptions/errors/api-error';
import { RolesService } from 'src/roles/roles.service';
import RequestWithUser from 'src/types/request-with-user.type';
import TownModel from './models/town.model';
import { TownClass } from './schemas/town.schema';

@Controller('town')
export class TownController {
  constructor(
    @InjectModel('Town') private TownModel: Model<TownClass>,
    private RolesService: RolesService
  ) {} 

  @Get('all')
  async all() {
    return await this.TownModel.find({})
  }

  @Get('get-by-id')
  async get_by_id(
    @Query('_id') _id: string, 
  ) {
    let candidate = this.TownModel.findById(_id)
    if (!candidate) {
      throw ApiError.BadRequest('Город с таким ID не найден')
    }
    
    return candidate
  }

  @UseGuards(GlobalAdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async create(
    @Body('name') name: string, 
  ) {
    await this.TownModel.create({ name })
    return { message: `Город ${name} создан` }
  }
  
  @UseGuards(AuthGuard)
  @Get('get-administered-towns')
  async getAdministeredSchools(
    @Req() req: RequestWithUser
  ) {
    if (this.RolesService.isGlobalAdmin(req.user.roles))
      return this.TownModel.find({})

    return await this.TownModel.find({
      _id: { $in: this.RolesService.getTownObjectIdsFromRoles(req.user.roles) }
    })
  }
}
