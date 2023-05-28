import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { CreateMessageDto } from './dto/create-message.dto'
import { UpdateMessageDto } from './dto/update-message.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Message } from './schemas/message.schema'
import { ChatService } from 'src/chat/chat.service'
import { Socket } from 'socket.io'
import { MessageActions } from './types/message-actions.types'
import { Chat } from 'src/chat/schemas/chat.schema'

@Injectable()
export class MessageService {
	constructor(
		@InjectModel('Message') private readonly messageModel: Model<Message>,
		@InjectModel('Chat') private readonly chatModel: Model<Chat>,
		private readonly chatService: ChatService
	) {}

	async createMessage(createMessageDto: CreateMessageDto, client: Socket) {
		const message = await this.messageModel.create(createMessageDto)
		const chat = await this.chatModel.findByIdAndUpdate(
			createMessageDto.chatId,
			{ $push: { messages: message._id } }
		)
		const toUserSocketIds = []
		for (let i = 0; i < chat.users.length; i++) {
			if (chat.users[i] !== createMessageDto.user)
				toUserSocketIds.push(
					await this.chatService.getSocket(chat.users[i])
				)
		}

		for (let k = 0; k < toUserSocketIds.length; k++) {
			client
				.to(toUserSocketIds[k])
				.emit(MessageActions.receive_new, message)
		}
		return message
	}
}
