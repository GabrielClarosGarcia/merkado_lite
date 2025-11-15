import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userService.validateUser(email, password);
    if (!user) throw new Error('Credenciales incorrectas');

    const payload = {
      sub: user.id_user,
      email: user.email,
      role: user.role?.name,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Login exitoso',
      token,
      user: {
        id: user.id_user,
        email: user.email,
        role: user.role,
      },
    };
  }
}
