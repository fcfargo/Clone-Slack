import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../common/decorators/user.decorator';
import { JoinRequestDto } from './dto/join.request.dto';
import { UserResponseDto } from './dto/user.reponse.dto';
import { UsersService } from './users.service';

@ApiTags('USER')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @ApiResponse({ type: UserResponseDto })
  @ApiOperation({ summary: '내 정보 조회' })
  @Get()
  getAllUsers(@User() user) {
    return user;
  }

  @ApiOperation({ summary: '회원가입' })
  @Post()
  createUser(@Body() data: JoinRequestDto) {
    this.usersService.postUsers(data.email, data.nickname, data.password);
  }
  @ApiResponse({ status: 200, description: '요청 성공', type: UserResponseDto })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @ApiOperation({ summary: '로그인' })
  @Post('login')
  SignIn(@User() user) {
    return user;
  }

  @ApiOperation({ summary: '로그아웃' })
  @Post('logout')
  SignOut(@Req() req, @Res() res) {
    req.logOut();
    // 로그아웃 풀기
    res.clearCookie('connect.sid', { httpOnly: true });
    res.send('ok');
  }
}
