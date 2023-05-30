import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Chat } from './schemas/chat.schema'
import { StartChatDto } from './dto/start-chat.dto'
import { User } from 'src/user/schemas/user.schema'
import { UserConnection } from './schemas/user-connection.schema'
import { ConnectDto } from './dto/connect.dto'
import { Socket } from 'socket.io'
import { DeleteChatDto } from './dto/delete-chat.dto'
import { ChatActions } from './types'

@Injectable()
export class ChatService {
	constructor(
		@InjectModel('Chat') private readonly chatModel: Model<Chat>,
		@InjectModel('User') private readonly userModel: Model<User>,
		@InjectModel('UserConnection')
		private readonly userConnectionModel: Model<UserConnection>
	) {}

	async connect(ConnectDto: ConnectDto, clientId: string) {
		await this.userConnectionModel.deleteMany({ user: ConnectDto.userId })
		this.userConnectionModel.create({
			socketId: clientId,
			user: ConnectDto.userId,
		})
	}

	async startChat(startChatDto: StartChatDto) {
		const { fromUserId, toUserId } = startChatDto
		const newChat = await this.chatModel.create({
			users: [fromUserId, toUserId],
		})

		await this.userModel.findByIdAndUpdate(toUserId, {
			$push: { chats: newChat._id },
		})

		await this.userModel.findByIdAndUpdate(fromUserId, {
			$push: { chats: newChat._id },
		})
		

		const chat = await this.getOneChat(newChat._id)
		const users = []
		for (let l = 0; l < chat.users.length; l++) {
			users.push(this.pickUserPublicData(chat.users[l]))
		}
		return {
			...chat,
			users,
		}
	}

	async getSocket(userId: Types.ObjectId) {
		const connectionData = await this.userConnectionModel.findOne({
			user: userId,
		})
		if (!connectionData) return null
		return connectionData.socketId
	}

	async getOneChat(chatId: Types.ObjectId): Promise<any> {
		const chat = await this.chatModel
			.findById(chatId)
			.populate('users')
			.populate('messages')
			.exec()
		return chat
	}

	async deleteChat(deleteChatDto: DeleteChatDto, client: Socket) {
		const chat = await this.chatModel.findById(deleteChatDto.chatId)
		for (let i = 0; i < chat.users.length; i++) {
			const user = chat.users[0]
			await this.userModel.findByIdAndUpdate(user, {
				$pull: { chats: chat._id },
			})
			const socketId = await this.getSocket(user._id)
			if (socketId) {
				client.to(socketId).emit(ChatActions.receive_delete, chat._id)
			}
		}
		await chat.deleteOne()
	}

	pickUserPublicData(
		user: Omit<
			User & {
				_id: Types.ObjectId
			},
			never
		>
	) {
		return {
			_id: user._id,
			email: user.email,
			username: user.username,
			avatar: user.avatar,
		}
	}
}
