import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  refresh(@Request() req) {
    return this.authService.refreshToken(req.user.sub, req.user.refreshToken);
  }

  @Post('recover')
  recover(@Body('email') email: string) {
    return this.authService.recoverPassword(email);
  }

  @Post('reset-password')
  reset(@Body() body: { token: string, password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }
}
