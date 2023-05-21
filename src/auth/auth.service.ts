import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from 'src/user/schemas/user.schema'
import { LoginDto, RegistrationDto } from './dto'
import { JwtService } from '@nestjs/jwt'
import { jwt_access_secret, jwt_refresh_secret } from 'src/constants'
import { JwtPayload } from './types'

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		@InjectModel('User') private readonly userModel: Model<User>
	) {}

	async registration(dto: RegistrationDto) {
		const isUserExist = await this.userModel.findOne({ email: dto.email })
		if (isUserExist)
			throw new BadRequestException('This email is already taken')

		const user = await this.userModel.create(dto)
		const tokens = await this.generateTokens({ _id: user._id })

		return { tokens, user: this.pickUserData(user) }
	}

	async login(dto: LoginDto) {
		const user = await this.userModel.findOne({ ...dto })
		if (!user) throw new UnauthorizedException('Wrong credentials')

		const tokens = await this.generateTokens({ _id: user._id })

		return { tokens, user: this.pickUserData(user) }
	}

	async refresh(refreshToken: string) {
		if (!refreshToken) throw new UnauthorizedException()
		try {
			const refreshTokenData = await this.jwtService.verifyAsync(
				refreshToken,
				{
					secret: jwt_refresh_secret,
				}
			)

			const payload: JwtPayload = {
				_id: refreshTokenData._id,
			}

			const accessToken = await this.jwtService.signAsync(payload, {
				expiresIn: '20m',
				secret: jwt_access_secret,
			})

			return { accessToken }
		} catch (e) {
			throw new UnauthorizedException()
		}
	}

	private async generateTokens(payload: JwtPayload) {
		const accessToken = await this.jwtService.signAsync(payload, {
			expiresIn: '20m',
			secret: jwt_access_secret,
		})

		const refreshToken = await this.jwtService.signAsync(payload, {
			expiresIn: '15d',
			secret: jwt_refresh_secret,
		})
		return { accessToken, refreshToken }
	}

	private pickUserData(user: User) {
		return {
			email: user.email,
			username: user.username,
		}
	}
}
