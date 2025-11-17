import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userService.validateUser(email, password);

    if (!user) {
      throw new HttpException('Credenciales incorrectas', HttpStatus.UNAUTHORIZED);
    }

    const payload = { sub: user.id_user, email: user.email, role: user.role?.name };

    return {
      message: 'Inicio de sesión exitoso',
      token: this.jwtService.sign(payload),
      user: {
        id: user.id_user,
        email: user.email,
        role: user.role?.name,
      },
    };
  }
}
