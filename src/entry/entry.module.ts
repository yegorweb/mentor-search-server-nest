import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { TokenModule } from 'src/token/token.module';
import { EntryController } from './entry.controller';
import EntryModel from './models/entry.model';
import { EntryClass, EntrySchema } from './schemas/entry.schema';

@Module({
  imports: [
    EntryModel,
    TokenModule
  ],
  controllers: [EntryController],
})
export class EntryModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        'get-entries-to-moderation', 
        'create', 
        'edit', 
        'response',
        'cancel-response',
        'verify',
        'delete'
      )
  }
}
