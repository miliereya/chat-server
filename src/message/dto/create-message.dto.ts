import { IsDate, IsEmail, IsString } from "class-validator"
import { Types } from "mongoose"

export class CreateMessageDto {
	@IsString()
	chatId: Types.ObjectId

	@IsDate()
	date: Date

	@IsString()
	username: string

	@IsString()
	text: string
}
