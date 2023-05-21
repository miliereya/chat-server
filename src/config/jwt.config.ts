import { ConfigService } from '@nestjs/config'
import { JwtModuleOptions } from '@nestjs/jwt/dist'

export const getJWTConfig = async (
	configService: ConfigService
): Promise<JwtModuleOptions> => ({
	secret: process.env.JWT_ACCESS_SECRET,
})
