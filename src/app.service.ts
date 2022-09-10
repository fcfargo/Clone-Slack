import { Injectable } from '@nestjs/common';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService {
  constructor(private userService: UsersService) {}
  getHello(): string {
    return process.env.SECRET;
  }
}
