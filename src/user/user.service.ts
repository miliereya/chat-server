import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { User } from './schemas/user.schema'
import { UpdateAvatarDto } from './dto/update-avatar.dto'
import { FindUsersDto } from './dto/find-users.dto'
import { TypeFindUsersMongooseParams } from './types'

@Injectable()
export class UserService {
	constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

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
		return this.pickUserData(user)
	}

	async findByIdPublic(_id: Types.ObjectId) {
		const user = await this.userModel.findById(_id)
		if (!user) throw new NotFoundException('No user by following id')

		return { ...this.pickUserData(user), _id: user._id }
	}

	private async findById(_id: Types.ObjectId) {
		const user = await this.userModel.findById(_id)
		if (!user) throw new NotFoundException('No user by following id')

		return user
	}
	pickUserData(
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
