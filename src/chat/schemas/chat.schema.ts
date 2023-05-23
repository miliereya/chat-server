import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class Chat {
	@Prop()
	users: Types.ObjectId[]

	@Prop()
	messages: Types.ObjectId[]
}

export const ChatSchema = SchemaFactory.createForClass(Chat)
