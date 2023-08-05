import { ApiProperty } from "@nestjs/swagger";

export class AuthDto {
    @ApiProperty({ default: 'test@example.ru', })
    email: string;
    @ApiProperty({ default: 'P@ssw0rd', })
    password: string;
}
  