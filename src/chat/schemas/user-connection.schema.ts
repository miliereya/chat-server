import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema({ timestamps: true })
export class UserConnection {
	@Prop()
	user: Types.ObjectId

	@Prop()
	socketId: string
}

export const UserConnectionSchema = SchemaFactory.createForClass(UserConnection)
