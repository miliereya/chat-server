import { IsString } from 'class-validator'
import { TypeFindUsersQuery } from '../types'
import { Types } from 'mongoose'

export class FindUsersDto {
	@IsString()
	searchField: TypeFindUsersQuery

	@IsString()
	value: string

    @IsString()
    userId: Types.ObjectId
}
