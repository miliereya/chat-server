import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Types } from 'mongoose'

export const UserId = createParamDecorator(
	(data: Types.ObjectId, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest()
		const userId = request.userId._id

		return userId
	}
)
