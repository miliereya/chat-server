import { Test, TestingModule } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Connection, Model, Types, connect } from 'mongoose'
import { getModelToken } from '@nestjs/mongoose'
import {
	BadRequestException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { UserService } from './user.service'
import { User, UserSchema } from './schemas/user.schema'
import { AuthService } from '../auth/auth.service'
import { JwtService } from '@nestjs/jwt'
import { RegistrationDto } from '../auth/dto'

describe('auth.service-spec.ts', () => {
	let service: UserService
	let authService: AuthService
	let mongod: MongoMemoryServer
	let mongoConnection: Connection
	let userModel: Model<User>

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create()
		const uri = mongod.getUri()
		mongoConnection = (await connect(uri)).connection
		userModel = mongoConnection.model('User', UserSchema)
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				AuthService,
				JwtService,
				{ provide: getModelToken('User'), useValue: userModel },
			],
		}).compile()

		service = module.get<UserService>(UserService)
		authService = module.get<AuthService>(AuthService)
	})

	afterAll(async () => {
		await mongoConnection.dropDatabase()
		await mongoConnection.close()
		await mongod.stop()
	})

	afterEach(async () => {
		const collections = mongoConnection.collections
		for (const key in collections) {
			const collection = collections[key]
			await collection.deleteMany({})
		}
	})

	const wrongUserId: Types.ObjectId =
		'646b6de144cc2060e15c3b7b' as unknown as Types.ObjectId
	const testEmail = 'test@mail.ru'
	const testEmail2 = 'test2@mail.ru'
	const username = 'username'
	const password = 'testtest'
	const avatar = 'avatar'

	const userCredentials: RegistrationDto = {
		email: testEmail,
		password,
		username,
	}
	describe('findByIdPublic()', () => {
		it('should find user by id', async () => {
			const userData = await authService.registration(userCredentials)
			const userId = userData.user._id
			expect((await service.findByIdPublic(userId))._id).toStrictEqual(
				userId
			)
		})

		it('should throw 404 (No user by following id)', async () => {
			await expect(service.findByIdPublic(wrongUserId)).rejects.toThrow(
				new NotFoundException('No user by following id')
			)
		})
	})

	describe('updateAvatar()', () => {
		it('should update avatar', async () => {
			const userData = await authService.registration(userCredentials)
			const userId = userData.user._id
			expect(
				(await service.updateAvatar(userId, { avatar })).avatar
			).toStrictEqual(avatar)
		})

		it('should throw 404 (No user by following id)', async () => {
			await expect(
				service.updateAvatar(wrongUserId, { avatar })
			).rejects.toThrow(new NotFoundException('No user by following id'))
		})
	})

	describe('findUsers()', () => {
		it("should return [] with no matches", async () => {
			expect(
				await service.findUsers({
					userId: wrongUserId,
					value: testEmail,
					searchField: 'email',
				})
			).toStrictEqual([])
		})

		it("should return [] (user can't find himself)", async () => {
			const userData = await authService.registration(userCredentials)
			const user = userData.user
			expect(
				await service.findUsers({
					userId: user._id,
					value: user.email,
					searchField: 'email',
				})
			).toStrictEqual([])
		})

		it('should return 1 user by email', async () => {
			const userData = await authService.registration(userCredentials)
			const user = userData.user
			expect(
				(
					await service.findUsers({
						userId: wrongUserId,
						value: user.email,
						searchField: 'email',
					})
				)[0].email
			).toStrictEqual(user.email)
		})

		it('should return 1 user by username', async () => {
			const userData = await authService.registration(userCredentials)
			const user = userData.user
			expect(
				(
					await service.findUsers({
						userId: wrongUserId,
						value: user.username,
						searchField: 'username',
					})
				)[0].username
			).toStrictEqual(user.username)
		})

		it('should return 2 users by email', async () => {
			const userData = await authService.registration(userCredentials)
			const user = userData.user
			await authService.registration({
				...userCredentials,
				email: testEmail2,
			})
			expect(
				(
					await service.findUsers({
						userId: wrongUserId,
						value: user.email.slice(0, 4),
						searchField: 'email',
					})
				).length
			).toStrictEqual(2)
		})

		it('should return 2 users by username', async () => {
			await authService.registration(userCredentials)
			await authService.registration({
				...userCredentials,
				email: testEmail2,
			})
			expect(
				(
					await service.findUsers({
						userId: wrongUserId,
						value: username,
						searchField: 'username',
					})
				).length
			).toStrictEqual(2)
		})
	})
})
