import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type TokenDocument = HydratedDocument<TokenClass>

@Schema()//{ collection: 'Token' })
export class TokenClass {
  @Prop({ 
    required: true, 
    type: mongoose.Types.ObjectId, 
    ref: 'User',
  })
  user: mongoose.Types.ObjectId

  @Prop({ 
    type: String, 
    required: true 
  })
  refreshToken: string
}

export const TokenSchema = SchemaFactory.createForClass(TokenClass)
