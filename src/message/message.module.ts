import { Module } from '@nestjs/common'
import { MessageService } from './message.service'
import { MessageGateway } from './message.gateway'
import { MongooseModule } from '@nestjs/mongoose'
import { MessageSchema } from './schemas/message.schema'
import { ChatModule } from 'src/chat/chat.module'
import { ChatSchema } from 'src/chat/schemas/chat.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Message', schema: MessageSchema },
			{ name: 'Chat', schema: ChatSchema },
		]),
		ChatModule,
	],
	providers: [MessageGateway, MessageService],
	exports: [MessageService],
})
export class MessageModule {}
