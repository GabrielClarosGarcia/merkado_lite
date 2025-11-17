import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Debe ingresar un email válido' })
  email: string;

  @IsNotEmpty({ message: 'Debe ingresar una contraseña' })
  @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres' })
  password: string;
}
