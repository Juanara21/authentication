import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../users/dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const { correo, password } = loginUserDto;
   console.log(`Intentando iniciar sesión: ${correo}`);

    const user = await this.usersService.findByEmail(correo);
    if (!user) {
      console.warn(`Usuario no encontrado: ${correo}`);
      throw new UnauthorizedException('El usuario no está registrado.');
    }

    if (!user.activo) {
      console.warn(`Usuario inactivo: ${correo}`);
      throw new UnauthorizedException('La cuenta está desactivada. Contacte al administrador.');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      console.warn(`Contraseña incorrecta para: ${correo}`);
      throw new UnauthorizedException('La contraseña es incorrecta.');
    }

    const payload = { sub: user._id, correo: user.correo };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    await this.usersService.updateRefreshToken(user.id, refreshToken);
    console.log(`Sesión iniciada correctamente para: ${correo}`);

    return {
      message: 'Inicio de sesión exitoso.',
      accessToken,
      refreshToken,
    };
  }
  

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    if (!user.refreshToken) {
      throw new UnauthorizedException('No hay refreshToken asociado al usuario.');
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('El refreshToken no es válido.');
    }

    try {
      this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (error) {
      console.error(`Refresh token inválido: ${error.message}`);
      throw new UnauthorizedException('Refresh token expirado o inválido.');
    }

    const payload = { sub: user._id, correo: user.correo };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });

    return {
      message: 'Token renovado correctamente.',
      accessToken,
    };
  }

  async recoverPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Correo no registrado');
  
    const token = this.jwtService.sign({ sub: user._id }, { expiresIn: '30m' });
    const resetLink = `http://localhost:3000/auth/reset-password/${token}`;
  
    const html = `
  <div style="font-family: Arial, sans-serif; padding: 16px;">
    <h2 style="color: #00569e;">Recuperación de contraseña</h2>
    <p>Hola ${user.nombre},</p>
    <p>Haz clic en el botón para restablecer tu contraseña. Este enlace es válido por 30 minutos.</p>
    <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background-color:#47c5fb;color:white;text-decoration:none;border-radius:5px;">Restablecer contraseña</a>
    <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
    <p style="font-size:12px;color:#999;">JasProTech</p>
  </div>
`;
  
    await this.mailerService.sendMail(email, 'Recuperación de contraseña', html);
  
    return { message: 'Correo enviado exitosamente' };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: any;

    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (err) {
      console.warn(`Token inválido al intentar restablecer contraseña: ${err.message}`);
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(payload.sub, { password: hashedPassword });

    return {
      message: 'Contraseña restablecida correctamente.',
    };
  }
}
