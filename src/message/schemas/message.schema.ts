import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class Message {
	@Prop()
	chatId: Types.ObjectId

	@Prop()
	email: string

	@Prop()
	date: Date

	@Prop()
	username: string

	@Prop()
	text: string
}

export const MessageSchema = SchemaFactory.createForClass(Message)
