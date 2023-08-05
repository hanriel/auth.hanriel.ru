import {
    Body,
    Controller,
    Get,
    Post,
    Req,
  } from '@nestjs/common';
  import { Request } from 'express';
  import { CreateUserDto } from 'src/users/dto/create-user.dto';
  import { AuthService } from './auth.service';
  import { AuthDto } from './dto/auth.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.route';
  

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('signup')
    signup(@Body() createUserDto: CreateUserDto) {
        return this.authService.signUp(createUserDto);
    }

    @Public()
    @Post('signin')
    @ApiBody({ type: AuthDto })
    signin(@Body() data: AuthDto) {
        return this.authService.signIn(data);
    }

    @Get('logout')
    logout(@Req() req: Request) {
        this.authService.logout(req.cookies.user['sub']);
    }

    @Get('refresh')
    refreshTokens(@Req() req: Request) {
    const userId = req.cookies.user['sub'];
    const refreshToken = req.cookies.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
    }
}
