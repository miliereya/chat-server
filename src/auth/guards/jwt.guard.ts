import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { jwt_access_secret } from '../../constants'

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(private jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest()
		const token = this.extractTokenFromHeader(request)
		if (!token) {
			throw new UnauthorizedException('Access token was not provided')
		}
		try {
			const payload = await this.jwtService.verifyAsync(token, {
				secret: jwt_access_secret,
			})
			request.userId = payload
		} catch {
			throw new UnauthorizedException('Access token validation failed')
		}
		return true
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? []
		return type === 'Bearer' ? token : undefined
	}
}
