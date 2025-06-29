import { Controller, Get, Post, Req, Body, Patch, Query, Param, Delete, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, FindAllQueryParamsDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ApiSecurity, } from '@nestjs/swagger';
import { Request } from 'express';




@ApiSecurity('auth-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }


  @Get()
  findAll(@Query() queryParams: FindAllQueryParamsDto) {
    try {
      return this.usersService.findAll(queryParams);
    } catch (error) {
      throw error;
    }
  }



  @Delete('/:id')
  remove(@Param('id') id: string, @Req() req: Request) {
    try {
      return this.usersService.remove(id, req);
    } catch (error) {
      throw error;
    }
  }

  @Post('/signup')
  async signup(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    try {
      return this.usersService.create(createUserDto, req);
    } catch (error) {
      throw error;
    }
  }



  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return this.usersService.login(loginDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Post('/change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    try {
      return this.usersService.changePassword(changePasswordDto);
    } catch (error) {
      throw error;
    }
  }

  // @Get('/me')
  // async getUser(@Request() req) {
  //   try {
  //     const userId = req.decoded.userId;
  //     return this.usersService.getUser(userId);
  //   } catch (error) {
  //     throw error;
  //   }

  // }

  @Patch('/update-users')
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    try {
      return this.usersService.update(updateUserDto, req);
    } catch (error) {
      throw error;
    }
  }


  @Patch('/reset-password/:token')//:token/user/reset-password
  async resetPassword(@Param('token') token: string, @Body('password') newPassword: string,) {
    try {
      return this.usersService.resetPassword(token, newPassword);
    } catch (error) {
      throw error;
    }
  }

  @Post('/forgot-password')
  async forgotPassword(@Body('email') email: string) {
    try {
      return await this.usersService.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  }
}
