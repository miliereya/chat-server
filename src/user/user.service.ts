import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { User } from './schemas/user.schema'
import { UpdateAvatarDto } from './dto/update-avatar.dto'
import { FindUsersDto } from './dto/find-users.dto'
import { TypeFindUsersMongooseParams } from './types'
import { ChatService } from 'src/chat/chat.service'
import { UpdateUsernameDto } from './dto/update-username.dto'

@Injectable()
export class UserService {
	constructor(
		@InjectModel('User') private readonly userModel: Model<User>,
		private readonly chatService: ChatService
	) {}

	async findUsers(dto: FindUsersDto) {
		const query: TypeFindUsersMongooseParams = {
			_id: { $ne: dto.userId },
		}
		query[dto.searchField] = new RegExp(dto.value, 'i')
		return await this.userModel
			.find(query)
			.select('_id email avatar username')
	}

	async updateAvatar(userId: Types.ObjectId, dto: UpdateAvatarDto) {
		const user = await this.findById(userId)
		user.avatar = dto.avatar
		await user.save()
		return {
			avatar: user.avatar,
		}
	}

	async updateUsername(userId: Types.ObjectId, dto: UpdateUsernameDto) {
		const user = await this.findById(userId)
		user.username = dto.username
		await user.save()
		return {
			username: user.username,
		}
	}

	async findByIdPublic(_id: Types.ObjectId) {
		const user = await this.userModel.findById(_id)
		if (!user) throw new NotFoundException('No user by following id')
		const userData = await this.pickUserData(user)
		return { ...userData.user, _id: user._id }
	}

	private async findById(_id: Types.ObjectId) {
		const user = await this.userModel.findById(_id)
		if (!user) throw new NotFoundException('No user by following id')

		return user
	}

	async pickUserData(
		user: Omit<
			User & {
				_id: Types.ObjectId
			},
			never
		>
	) {
		const chats = []
		for (let i = 0; i < user.chats.length; i++) {
			const chat = await this.chatService.getOneChat(user.chats[i])
			const users = []
			for (let l = 0; l < chat.users.length; l++) {
				users.push(this.pickUserPublicData(chat.users[l]))
			}
			chats.push({
				_id: chat._id,
				createdAt: chat.createdAt,
				updatedAt: chat.updatedAt,
				messages: chat.messages,
				users,
			})
		}
		return {
			user: {
				_id: user._id,
				email: user.email,
				username: user.username,
				avatar: user.avatar,
			},
			chats,
		}
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
