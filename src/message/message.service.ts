import { Injectable } from '@nestjs/common'
import { CreateMessageDto } from './dto/create-message.dto'
import { UpdateMessageDto } from './dto/update-message.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Message } from './schemas/message.schema'

@Injectable()
export class MessageService {
	constructor(
		@InjectModel('Message') private readonly messageModel: Model<Message>
	) {}

	clientToUser = {}

	async joinRoom(email: string, clientId: string) {
		this.clientToUser[clientId] = email

		return Object.values(this.clientToUser)
	}

	getClientEmail(clientId: string) {
		return this.clientToUser[clientId]
	}

	async createMessage(createMessageDto: CreateMessageDto, clientId: string) {
		const message = {
			...createMessageDto,
			email: this.clientToUser[clientId],                                                       
		}
		return await this.messageModel.create(message)
	}

	findAll() {
		return `This action returns all message`
	}

	findOne(id: number) {
		return `This action returns a #${id} message`
	}

	update(id: number, updateMessageDto: UpdateMessageDto) {
		return `This action updates a #${id} message`
	}

	remove(id: number) {
		return `This action removes a #${id} message`
	}
}
