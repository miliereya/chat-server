import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	WebSocketServer,
	ConnectedSocket,
} from '@nestjs/websockets'
import { ChatService } from './chat.service'
import { StartChatDto } from './dto/start-chat.dto'
import { client_url } from 'src/constants'
import { Server, Socket } from 'socket.io'
import { ConnectDto } from './dto/connect.dto'

@WebSocketGateway({
	cors: {
		credentials: true,
		origin: client_url,
	},
})
export class ChatGateway {
	@WebSocketServer()
	server: Server
	constructor(private readonly chatService: ChatService) {}

	@SubscribeMessage('chat/connect')
	async connect(
		@MessageBody() ConnectDto: ConnectDto,
		@ConnectedSocket() client: Socket
	) {
		this.chatService.connect(ConnectDto, client.id)
		
	}

	@SubscribeMessage('chat/start')
	async startChat(
		@MessageBody() startChatDto: StartChatDto,
		@ConnectedSocket() client: Socket
	) {
		const chat = await this.chatService.startChat(startChatDto)

		client.to(startChatDto.toUserId).emit('chat/receive-new', chat)

		return chat
	}
}
