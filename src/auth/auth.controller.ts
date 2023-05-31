import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common'
import { Auth } from './decorators/auth.decorator'
import { LoginDto, RegistrationDto } from './dto'
import { AuthService } from './auth.service'
import { UserId } from 'src/user/decorators/userId.decorator'
import { Types } from 'mongoose'
import { Response, Request } from 'express'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('registration')
	async registration(@Body() dto: RegistrationDto, @Res() res: Response) {
		const data = await this.authService.registration(dto)
		res.cookie('refreshToken', data.tokens.refreshToken, { httpOnly: true })
		delete data.tokens.refreshToken
		return res.send(data)
	}

	@HttpCode(200)
	@Post('login')
	async login(@Body() dto: LoginDto, @Res() res: Response) {
		const data = await this.authService.login(dto)
		res.cookie('refreshToken', data.tokens.refreshToken, { httpOnly: true })
		delete data.tokens.refreshToken
		return res.send(data)
	}

	@HttpCode(200)
	@Post('refresh')
	async refresh(@Req() req: Request) {
		return this.authService.refresh(req?.cookies['refreshToken'])
	}

	@Get('drop-db')
	async dropDB() {
		return this.authService.dropDb()
	}
}
