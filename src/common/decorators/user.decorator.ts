import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** reponse 객체의 user 변수 값을 반환하는 데코레이터 */
export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
