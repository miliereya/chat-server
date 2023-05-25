import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema({ timestamps: true })
export class Chat {
	@Prop()
	users: Types.ObjectId[]

	@Prop({ default: [] })
	messages: Types.ObjectId[]
}

export const ChatSchema = SchemaFactory.createForClass(Chat)
