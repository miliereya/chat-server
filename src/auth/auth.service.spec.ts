import { Test, TestingModule } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Connection, Model, connect } from 'mongoose'
import { getModelToken } from '@nestjs/mongoose'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { User, UserSchema } from '../user/schemas/user.schema'
import { JwtService } from '@nestjs/jwt'
import { LoginDto, RegistrationDto } from './dto'

describe('auth.service-spec.ts', () => {
	let service: AuthService
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
				AuthService,
				JwtService,
				{ provide: getModelToken('User'), useValue: userModel },
			],
		}).compile()

		service = module.get<AuthService>(AuthService)
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

	const testEmail = `test${new Date()}@mail.ru`
	const password = 'testtest'
	const wrongPassword = 'wrongpassword'
	const username = 'username'

	describe('registration()', () => {
		const userCredentials: RegistrationDto = {
			email: testEmail,
			password,
			username,
		}
		it('should register user', async () => {
			const data = await service.registration(userCredentials)
			expect(data.user.email).toStrictEqual(userCredentials.email)
		})

		it('should throw 400 (This email is already taken)', async () => {
			await service.registration(userCredentials)
			await expect(service.registration(userCredentials)).rejects.toThrow(
				new BadRequestException('This email is already taken')
			)
		})
	})

	describe('login()', () => {
		const loginDto: LoginDto = {
			email: testEmail,
			password,
		}

		const userCredentials: RegistrationDto = {
			email: testEmail,
			password,
			username,
		}

		it('should login user', async () => {
			await service.registration(userCredentials)
			const data = await service.login(loginDto)
			expect(data.user.email).toStrictEqual(loginDto.email)
		})

		it('should throw 401 (No user by following email)', async () => {
			await expect(service.login(userCredentials)).rejects.toThrow(
				new UnauthorizedException('No user by following email')
			)
		})

		it('should throw 400 (Wrong credentials)', async () => {
			await service.registration(userCredentials)
			await expect(
				service.login({ ...userCredentials, password: wrongPassword })
			).rejects.toThrow(new BadRequestException('Wrong credentials'))
		})
	})

	describe('refresh()', () => {
		const userCredentials: RegistrationDto = {
			email: testEmail,
			password,
			username,
		}

		it('should return accessToken', async () => {
			const data = await service.registration(userCredentials)
			const refreshData = await service.refresh(data.tokens.refreshToken)
			expect(refreshData.tokens.accessToken).toBeDefined()
		})

		it('should throw 400 (No refresh token was provided)', async () => {
			await expect(service.refresh('')).rejects.toThrow(
				new BadRequestException('No refresh token was provided')
			)
		})

		it('should throw 401 (Wrong refresh token)', async () => {
			await expect(
				service.refresh('wrong refresh token')
			).rejects.toThrow(new UnauthorizedException('Wrong refresh token'))
		})
	})
})
