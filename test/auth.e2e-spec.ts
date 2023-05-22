import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from './../src/app.module'
import * as request from 'supertest'

describe('User E2E Test', () => {
	let app: INestApplication

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()
		await app.init()
	})

	const testEmail = `test${new Date()}@mail.ru`
	const password = 'testtest'
	const wrongPassword = 'wrongpassword'
	const toShortPassword = 'test'

	describe('registration', () => {
		it('should create new user', () => {
			return request(app.getHttpServer())
				.post('/auth/registration')
				.send({ email: testEmail, password })
				.expect(201)
		})

		it('should get 400 (This email is already taken)', () => {
			return request(app.getHttpServer())
				.post('/auth/registration')
				.send({ email: testEmail, password })
				.expect(400)
		})

		it('should get 400 trying to pass invalid data ', () => {
			return request(app.getHttpServer())
				.post('/auth/registration')
				.send({ email: testEmail, password: toShortPassword })
				.expect(400)
		})
	})

	// describe('Login', () => {
	// 	it('login user', () => {
	// 		return request(app.getHttpServer())
	// 			.post('/user/login')
	// 			.send({ email: testEmail, password })
	// 			.expect(201)
	// 	})

	// 	it('status 403 with wrong credentials', () => {
	// 		return request(app.getHttpServer())
	// 			.post('/user/login')
	// 			.send({ email: testEmail, password: wrongPassword })
	// 			.expect(401)
	// 	})
	// })
})
