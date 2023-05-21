import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { client_url } from './constants'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('api')
	app.use(cookieParser())
	app.useGlobalPipes(new ValidationPipe())
	app.enableCors({
		credentials: true,
		origin: client_url,
	})
	await app.listen(5000)
}
bootstrap()
