import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class undefinedToNullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // controller 이전 로직은 여기에 추가하면 된다.
    // return은 controller에서 반환하는 데이터와 동일하다.
    return next.handle().pipe(map((data) => (data === undefined ? null : data)));
  }
}
