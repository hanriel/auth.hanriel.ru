import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from './constants';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async signUp(createUserDto: CreateUserDto): Promise<any> {
      const userExists = await this.usersService.findByEmail(
        createUserDto.email,
      );

      if (userExists) {
        throw new BadRequestException('User already exists');
      }
  
      // Hash password
      const hash = await this.hashData(createUserDto.password);
      const newUser = await this.usersService.create({
        ...createUserDto,
        password: hash,
      });
      const tokens = await this.getTokens(newUser.email, newUser.email);
      await this.updateRefreshToken(newUser.email, tokens.refreshToken);
      return tokens;  
    }

    async signIn(data: AuthDto) {
      // Check if user exists
      const user = await this.usersService.findByEmail(data.email);
      if (!user) throw new BadRequestException('User does not exist');
      
      const passwordMatches = await bcrypt.compare(data.password, user.password);
      if (!passwordMatches)
        throw new BadRequestException('Password is incorrect');
      const tokens = await this.getTokens(user.email, user.email);
      await this.updateRefreshToken(user.email, tokens.refreshToken);
      return tokens;
    }
  
    async logout(email: string) {
      return this.usersService.update(email, { refreshToken: null });
    }

    hashData(data: string) {
      const saltOrRounds = 10;
      return bcrypt.hash(data, saltOrRounds);
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
      const hashedRefreshToken = await this.hashData(refreshToken);
      await this.usersService.update(userId, {
        refreshToken: hashedRefreshToken,
      });
    }
  
    async getTokens(userId: string, username: string) {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
          {
            sub: userId,
            username,
          },
          {
            secret: jwtConstants.access,
            expiresIn: '15m',
          },
        ),
        this.jwtService.signAsync(
          {
            sub: userId,
            username,
          },
          {
            secret: jwtConstants.secret,
            expiresIn: '7d',
          },
        ),
      ]);
  
      return {
        accessToken,
        refreshToken,
      };
    }

    async refreshTokens(userEmail: string, refreshToken: string) {
      const user = await this.usersService.findByEmail(userEmail);
      if (!user || !user.refreshToken)
        throw new ForbiddenException('Access Denied');
      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
      const tokens = await this.getTokens(user.email, user.email);
      await this.updateRefreshToken(user.email, tokens.refreshToken);
      return tokens;
    }
  
}
