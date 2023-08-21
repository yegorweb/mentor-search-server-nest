import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';
import { EntryModule } from './entry/entry.module';
import { TownModule } from './town/town.module';
import { SchoolModule } from './school/school.module';
import { RolesModule } from './roles/roles.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'development.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      connectionFactory: (connection) => {
        connection.plugin(require('mongoose-autopopulate'))
        return connection
      }
    }),
    AuthModule,
    TokenModule,
    UserModule,
    EntryModule,
    TownModule,
    SchoolModule,
    RolesModule,
    S3Module
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
