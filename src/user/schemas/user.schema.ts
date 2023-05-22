import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class User {
	@Prop({ unique: true })
	email: string

	@Prop()
	password: string

	@Prop()
	username: string

	@Prop({ default: '' })
	avatar: string
}

export const UserSchema = SchemaFactory.createForClass(User)
