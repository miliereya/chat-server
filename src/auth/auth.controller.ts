import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common'
import { Auth } from './decorators/auth.decorator'
import { LoginDto, RegistrationDto } from './dto'
import { AuthService } from './auth.service'
import { UserId } from 'src/user/decorators/userId.decorator'
import { Types } from 'mongoose'
import { Response, Request } from 'express'

@Controller('auth')
export class AuthController {
	constructor(private readonly AuthService: AuthService) {}

	@Post('registration')
	async registration(@Body() dto: RegistrationDto, @Res() res: Response) {
		const data = await this.AuthService.registration(dto)
		res.cookie('refreshToken', data.tokens.refreshToken, { httpOnly: true })
		delete data.tokens.refreshToken
		return res.send(data)
	}

	@HttpCode(200)
	@Post('login')
	async login(@Body() dto: LoginDto, @Res() res: Response) {
		const data = await this.AuthService.login(dto)
		res.cookie('refreshToken', data.tokens.refreshToken, { httpOnly: true })
		delete data.tokens.refreshToken
		return res.send(data)
	}

	@HttpCode(200)
	@Post('refresh')
	async refresh(@Req() req: Request) {
		return this.AuthService.refresh(req?.cookies['refreshToken'])
	}

	@Get('check')
	@Auth()
	async check(@UserId() userId: Types.ObjectId) {
		return userId
	}
}
