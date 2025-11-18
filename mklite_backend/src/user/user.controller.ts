import { Body, Controller, Post, Get, Param, Delete, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('/:id')
  getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: number) {
    return this.userService.DeleteUser(id);
  }

  @Put('/:id')
  updateUser(
    @Param('id') id: number,
    @Body() userData: Partial<CreateUserDto>
  ) {
    return this.userService.UpdateUser(id, userData);
  }
}