import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from 'src/user/schemas/user.schema'
import { JwtModule } from '@nestjs/jwt'
import { jwt_access_secret } from 'src/constants'
import { UserModule } from 'src/user/user.module'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
		JwtModule.register({
			global: true,
			secret: jwt_access_secret,
			signOptions: { expiresIn: '60s' },
		}),
		UserModule,
	],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule {}
