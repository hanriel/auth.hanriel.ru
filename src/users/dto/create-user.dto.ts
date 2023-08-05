import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ default: 'User', })
  name: string;
  @ApiProperty({ default: 'test@example.ru', })
  email: string;
  @ApiProperty({ default: 'P@ssw0rd', })
  password: string;
  @ApiProperty({ default: 'test', })
  refreshToken: string;
}