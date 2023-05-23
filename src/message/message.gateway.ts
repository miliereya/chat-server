import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	WebSocketServer,
	ConnectedSocket,
} from '@nestjs/websockets'
import { MessageService } from './message.service'
import { CreateMessageDto } from './dto/create-message.dto'
import { UpdateMessageDto } from './dto/update-message.dto'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class MessageGateway {
	@WebSocketServer()
	server: Server
	constructor(private readonly messageService: MessageService) {}

	@SubscribeMessage('create-message')
	async create(
		@MessageBody() createMessageDto: CreateMessageDto,
		@ConnectedSocket() client: Socket
	) {
		const message = await this.messageService.createMessage(
			createMessageDto, client.id
		)

		this.server.emit('message', message)

		return message
	}

	@SubscribeMessage('find-all-message')
	findAll() {
		return this.messageService.findAll()
    // пока не работает
	}

	@SubscribeMessage('join-room')
	joinRoom(
		@MessageBody('email') email: string,
		@ConnectedSocket() client: Socket
	) {
		return this.messageService.joinRoom(email, client.id)
	}

	@SubscribeMessage('typing')
	async typing(
		@MessageBody('isTyping') isTyping: boolean,
		@ConnectedSocket() client: Socket
	) {
		const email = await this.messageService.getClientEmail(client.id)

		client.broadcast.emit('typing', { email, isTyping })
	}

	// @SubscribeMessage('updateMessage')
	// update(@MessageBody() updateMessageDto: UpdateMessageDto) {
	// 	return this.messageService.update(updateMessageDto.id, updateMessageDto)
	// }

	// @SubscribeMessage('removeMessage')
	// remove(@MessageBody() id: number) {
	// 	return this.messageService.remove(id)
	// }
}
