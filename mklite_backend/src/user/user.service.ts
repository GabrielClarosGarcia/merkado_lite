import { Injectable, BadRequestException } from '@nestjs/common';
import { AppDataSource } from 'src/data-source';
import { User } from 'src/user/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from 'src/role/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  async createUser(data: CreateUserDto) {
    // 1. Verificar email duplicado
    const existing = await AppDataSource.manager.findOneBy(User, {
      email: data.email,
    });

    if (existing) {
      throw new BadRequestException('El email ya esta registrado');
    }

    // 2. Hashear password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Buscar rol "cliente"
    const clientRole = await AppDataSource.manager.findOneBy(Role, {
      name: 'cliente',
    });

    if (!clientRole) {
      throw new BadRequestException(
        'No se encontro el rol cliente. Debes crearlo en la tabla ROLE'
      );
    }

    // 4. Crear usuario con rol cliente
    const newUser = AppDataSource.manager.create(User, {
      ...data,
      password: hashedPassword,
      role: clientRole,
    });

    // 5. Guardar usuario
    return AppDataSource.manager.save(User, newUser);
  }

  async getAllUsers() {
    return AppDataSource.manager.find(User);
  }

  async getUserById(id: number) {
    return AppDataSource.manager.findOneBy(User, { id_user: id });
  }

  async DeleteUser(id: number) {
    return AppDataSource.manager.delete(User, { id_user: id });
  }

  async UpdateUser(id: number, data: Partial<CreateUserDto>) {
    return AppDataSource.manager.update(User, { id_user: id }, data);
  }
}