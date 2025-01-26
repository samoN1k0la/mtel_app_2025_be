import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { method: string; email?: string; password?: string }) {
    const { method, email, password } = body;

    switch (method) {
      case 'email':
        return this.authService.loginWithEmail(email, password);
      case 'guest':
        return this.authService.guestLogin();
      default:
        throw new Error('Invalid login method');
    }
  }

  @Post('register')
  async register(@Body() body: { 
    name: string;
    email: string; 
    password: string; 
    location: string;
    accountType: string;
  }) {
    const { name, email, password, location, accountType } = body;
    return this.authService.register(name, email, password, location, accountType);
  }
}

