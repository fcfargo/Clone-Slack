import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** response 객체의 local 변수 내부에 저장된 jwt 값을 반환하는 데코레이터
 ** jwt 토큰 사용 시, 해당 데코레이터를 사용하면 '@Res' 데코레이터 사용할 필요 없이 토큰을 가져올 수 있다.
 */
export const Token = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const response = ctx.switchToHttp().getResponse();
  return response.locals.jwt;
});
