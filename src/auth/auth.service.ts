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
import { jwt_access_secret, jwt_refresh_secret } from '../constants'
import { JwtPayload } from './types'
import { hash, genSalt, compare } from 'bcryptjs'
import { UserService } from '../user/user.service'

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		private userService: UserService,
		@InjectModel('User') private readonly userModel: Model<User>
	) {}

	async registration(dto: RegistrationDto) {
		const isUserExist = await this.userModel.findOne({ email: dto.email })
		if (isUserExist)
			throw new BadRequestException('This email is already taken')

		const salt = await genSalt(3)

		const userCredentials = {
			...dto,
			password: await hash(dto.password, salt),
		}

		const user = await this.userModel.create(userCredentials)
		const tokens = await this.generateTokens({ _id: user._id })

		return { tokens, user: this.userService.pickUserData(user) }
	}

	async login(dto: LoginDto) {
		const user = await this.userModel.findOne({ email: dto.email })
		if (!user) throw new UnauthorizedException('No user by following email')

		const isValidPassword = await compare(dto.password, user.password)
		if (!isValidPassword) throw new BadRequestException('Wrong credentials')

		const tokens = await this.generateTokens({ _id: user._id })

		return { tokens, user: this.userService.pickUserData(user) }
	}

	async refresh(refreshToken: string) {
		if (!refreshToken)
			throw new BadRequestException('No refresh token was provided')
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

			return { tokens: { accessToken } }
		} catch (e) {
			throw new UnauthorizedException('Wrong refresh token')
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
}
