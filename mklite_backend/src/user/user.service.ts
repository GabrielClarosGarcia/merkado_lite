// user.service.ts
import { Injectable } from '@nestjs/common';
import { AppDataSource } from 'src/data-source';
import { User } from './user.entity';
import { Role } from '../role/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  async createUser(userData: Partial<User>) {
  if (!userData) throw new Error('No se recibió data del usuario');

  const role = await AppDataSource.manager.findOneBy(Role, { id_role: 1 });
  if (!role) throw new Error('Role no encontrado');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  const user = AppDataSource.manager.create(User, {
    ...userData,
    password: hashedPassword,
    role,
  });

  return await AppDataSource.manager.save(User, user);
}


  async getAllUsers() {
    return await AppDataSource.manager.find(User);
  }

  async getUserById(id: number) {
    return await AppDataSource.manager.findOneBy(User, { id_user: id });
  }

  async DeleteUser(id: number) {
    return await AppDataSource.manager.delete(User, { id_user: id });
  }

  async UpdateUser(id: number, userData: Partial<User>) {
    return await AppDataSource.manager.update(User, { id_user: id }, userData);
  }

  async findByEmail(email: string) {
    return await AppDataSource.manager.findOneBy(User, { email });
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return user;
  }
}
