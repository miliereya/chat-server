import { Types } from "mongoose"

export interface IMessage {
	chatId: Types.ObjectId
	email: string
	text: string
	date: Date
}


