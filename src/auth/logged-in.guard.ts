import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
// 로그인 사용자가 요청할 경우 true 값 반환
export class LoggedInGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // request:  express에서 제공하는 req 객체와 동일
    return request.isAuthenticated();
  }
}
