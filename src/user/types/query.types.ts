import { Types } from "mongoose"

export type TypeFindUsersQuery = 'username' | 'email'
export type TypeFindUsersMongooseParams = {
	_id: { $ne: Types.ObjectId }
	email?: RegExp
	username?: RegExp
}