import { Body, Controller, Get, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { undefinedToNullInterceptor } from 'src/common/interceptors/undefinedToNull.interceptor';
import { User } from '../common/decorators/user.decorator';
import { JoinRequestDto } from './dto/join.request.dto';
import { UserResponseDto } from './dto/user.reponse.dto';
import { UsersService } from './users.service';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { NotLoggedInGuard } from 'src/auth/not-logged-in.guard';

@UseInterceptors(undefinedToNullInterceptor)
@ApiTags('USER')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiResponse({ status: 200, description: '성공', type: UserResponseDto })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @ApiOperation({ summary: '내 정보 조회' })
  @Get()
  getUsers(@User() user) {
    return user || false;
  }

  @ApiResponse({ status: 201, description: '성공', type: UserResponseDto })
  @UseGuards(new NotLoggedInGuard())
  @ApiOperation({ summary: '회원가입' })
  @Post()
  async createUser(@Body() body: JoinRequestDto) {
    return await this.usersService.createUserData(body.email, body.nickname, body.password);
  }

  @ApiResponse({ status: 200, description: '요청 성공', type: UserResponseDto })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @ApiOperation({ summary: '로그인' })
  @UseGuards(new LocalAuthGuard())
  @Post('login')
  SignIn(@User() user) {
    // 인증이 완료되면 local.serializer.ts를 거쳐, user.decorator.ts의 @User 데코레이터가 반환한 request.user 값이 user 변수에 할당된다.
    // @User 데코레이터를 로직을 거치면 req 객체의 전체 데이터 대신, req.user 데이터를 가져온다.
    // controller에서 req 객체 접근 횟수가 증가할수록, 추후 req 객체를 제공하는 플랫폼(express) 변경 시 유지 보수가 어려워진다. 이를 위해 @User 데코레이터를 사용하는 것이다.
    return user;
  }

  @UseGuards(new LoggedInGuard())
  @ApiOperation({ summary: '로그아웃' })
  @Post('logout')
  SignOut(@Req() req, @Res() res) {
    // 로그아웃 기능에서 clearCookie 메서드 사용하려면 req 객체를 controller로 가져오는 것이 불가피하다.
    // req.logOut();
    // 로그아웃 풀기
    res.clearCookie('connect.sid', { httpOnly: true });
    res.send('ok');
  }
}
