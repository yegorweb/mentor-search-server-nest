import { Body, Controller, Get, HttpCode, HttpStatus, Next, Post, Req, Res } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from 'src/user/interfaces/user.interface';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService) {}

	@HttpCode(HttpStatus.CREATED)
	@Post('registration')
	async registration(@Res() res: Response, @Next() next: NextFunction, @Body() user: User) {
		try {
			const userData = await this.AuthService.registration(user)
	
			res.cookie(
				'refreshToken', 
				userData.refreshToken,
				{ 
					maxAge: 30 * 24 * 60 * 60 * 1000, 
					httpOnly: true, 
					secure: eval(process.env.HTTPS) 
				}
			)
			return userData
		} catch (error) {
			next(error)
		}
	}
	
	@HttpCode(HttpStatus.OK)
	@Post('login')
	async login(@Res() res: Response, @Next() next: NextFunction, @Body() body: { email: string, password: string }) {
		try {
			const { email, password } = body
			const userData = await this.AuthService.login(email, password)
	
			res.cookie(
				'refreshToken', 
				userData.refreshToken, 
				{ 
					maxAge: 30 * 24 * 60 * 60 * 1000, 
					httpOnly: true, 
					secure: eval(process.env.HTTPS)
				}
			)
	
			return userData
		} catch (error) {
			next(error)
		}
	}
	
	@HttpCode(HttpStatus.OK)
	@Get('refresh')
	async refresh(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
		try {
			const { refreshToken } = req.cookies
	
			const userData = await this.AuthService.refresh(refreshToken)
			res.cookie(
				'refreshToken', 
				userData.refreshToken, 
				{ 
					maxAge: 30 * 24 * 60 * 60 * 1000, 
					httpOnly: true,
					secure: eval(process.env.HTTPS)
				}
			)
	
			return userData
		} catch (error) {
			next(error)
		}
	}
	
	@HttpCode(HttpStatus.OK)
	@Post('logout')
	async logout(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
		try {
			const { refreshToken } = req.cookies
	
			await this.AuthService.logout(refreshToken)
			res.clearCookie('refreshToken')
		} catch (error) {
			next(error)
		}
	}
	
	@HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Res() res: Response, @Next() next: NextFunction, @Body() body: { password: string, token: string, user_id: mongoose.Types.ObjectId }) {
    try {
      const userData = await this.AuthService.resetPassword(body)

      res.cookie(
				'refreshToken', 
				userData.refreshToken, 
				{ 
					maxAge: 30 * 24 * 60 * 60 * 1000, 
					httpOnly: true,
					secure: eval(process.env.HTTPS)
				}
			)
      return userData
    } catch (error) {
      next(error)
    }	
  }	

	@HttpCode(HttpStatus.OK)
	@Post('update')
	async update(@Res() res: Response, @Next() next: NextFunction, @Body() user: User) {
		try {
			const newUser = await this.AuthService.update(user)
			return newUser
		} catch (error) {
			next(error)
		}
	}
  
	@HttpCode(HttpStatus.OK)
	@Post('send-reset-link')
	async sendResetLink(@Res() res: Response, @Next() next: NextFunction, @Body() body: { email: string }) {
      try {
        let link = await this.AuthService.sendResetLink(body.email)	
        return link
      } catch (error) {
        next(error)	
      }
  }
	// async clearUsers() {
	//   try {
	//     this.AuthService.clearUsers()	
	//   } catch (error) {
	//		 next(error)
	//   }
	// }
}
