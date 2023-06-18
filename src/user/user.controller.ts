import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { UserService } from './user.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { UserId } from './decorators/userId.decorator'
import { UpdateAvatarDto } from './dto/update-avatar.dto'
import { Types } from 'mongoose'
import { TypeFindUsersQuery } from './types'
import { UpdateUsernameDto } from './dto/update-username.dto'

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('find')
	@Auth()
	async findUsers(
		@UserId() userId: Types.ObjectId,
		@Query('search_by') searchField: TypeFindUsersQuery,
		@Query('value') value: string
	) {
		return this.userService.findUsers({ userId, value, searchField })
	}

	@Get(':_id')
	@Auth()
	async findUser(@Param('_id') _id: Types.ObjectId) {
		return this.userService.findByIdPublic(_id)
	}

	@Post('update-avatar')
	@Auth()
	async updateAvatar(
		@UserId() userId: Types.ObjectId,
		@Body() dto: UpdateAvatarDto
	) {
		return this.userService.updateAvatar(userId, dto)
	}
	

	@Post('update-username')
	@Auth()
	async updateUsername(
		@UserId() userId: Types.ObjectId,
		@Body() dto: UpdateUsernameDto
	) {
		return this.userService.updateUsername(userId, dto)
	}
}
