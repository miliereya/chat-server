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
import { ChatActions } from './types'
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

	@SubscribeMessage(ChatActions.connect)
	async connect(
		@MessageBody() connectDto: ConnectDto,
		@ConnectedSocket() client: Socket
	) {
		this.chatService.connect(connectDto, client.id)
	}

	@SubscribeMessage(ChatActions.start)
	async startChat(
		@MessageBody() startChatDto: StartChatDto,
		@ConnectedSocket() client: Socket
	) {
		const chat = await this.chatService.startChat(startChatDto)
		const toUserSocketId = await this.chatService.getSocket(
			startChatDto.toUserId
		)

		if (toUserSocketId) {
			client.to(toUserSocketId).emit(ChatActions.receive_new, chat)
		}
		return chat
	}
}
