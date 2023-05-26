import { Module } from '@nestjs/common'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import { MongooseModule } from '@nestjs/mongoose'
import { ChatSchema } from './schemas/chat.schema'
import { UserSchema } from 'src/user/schemas/user.schema'
import { UserConnectionSchema } from './schemas/user-connection.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Chat', schema: ChatSchema },
			{ name: 'User', schema: UserSchema },
			{ name: 'UserConnection', schema: UserConnectionSchema },
		]),
	],
	providers: [ChatGateway, ChatService],
	exports: [ChatService],
})
export class ChatModule {}
