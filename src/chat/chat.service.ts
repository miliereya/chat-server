import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Chat } from './schemas/chat.schema'
import { StartChatDto } from './dto/start-chat.dto'
import { User } from 'src/user/schemas/user.schema'
import { UserConnection } from './schemas/user-connection.schema'
import { ConnectDto } from './dto/connect.dto'

@Injectable()
export class ChatService {
	constructor(
		@InjectModel('Chat') private readonly chatModel: Model<Chat>,
		@InjectModel('User') private readonly userModel: Model<User>,
		@InjectModel('UserConnection')
		private readonly userConnectionModel: Model<UserConnection>
	) {}

	connect(ConnectDto: ConnectDto, clientId: string) {
		this.userConnectionModel.create({
			socketId: clientId,
			user: ConnectDto.userId,
		})
	}

	async startChat(startChatDto: StartChatDto) {
		const { fromUserId, toUserId } = startChatDto
		const chat = await this.chatModel.create({
			users: [fromUserId, toUserId],
		})

		await this.userModel.findByIdAndUpdate(toUserId, {
			$push: { chats: chat },
		})

		this.userModel.findByIdAndUpdate(fromUserId, {
			$push: { chats: chat },
		})

		return chat
	}
}
