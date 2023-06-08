import { MiddlewareConsumer, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { TokenModule } from 'src/token/token.module';
import SchoolModel from './models/school.model';
import { SchoolClass, SchoolSchema } from './schemas/school.schema';
import { SchoolController } from './school.controller';

@Module({
  imports: [
    SchoolModel,
    TokenModule,
    JwtModule
  ],
  controllers: [SchoolController],
})
export class SchoolModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('create', 'switch-to-active')
  }
}
