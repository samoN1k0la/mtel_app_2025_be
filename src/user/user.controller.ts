import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get user info by email
  @Get('info')
  async getUserInfo(@Query('email') email: string) {
    if (!email) {
      return { status: 'Error', message: 'Email is required' };
    }

    try {
      const userInfo = await this.userService.getUserInfoByEmail(email);
      return userInfo;
    } catch (error) {
      return { status: 'Error', message: error.message };
    }
  }
}

