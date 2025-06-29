import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, FindAllQueryParamsDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { hashPassword} from 'src/auth/utility';
import { pushMail } from 'src/auth/notification';
import { sign } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { config as dotenvConfig } from 'dotenv';
import { Role } from 'src/role/entities/role.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login-user.dto';
import { Request } from 'express';



@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) { }

  async create(createUserDto: CreateUserDto, req: Request): Promise<any> {
    try {
      // const roleCheck = req?.decoded?.role; // Adjust if you access the user differently
      // if (!['admin', 'lecturer'].includes(roleCheck)) {
      //   throw new ForbiddenException('You do not have permission to delete user.');
      // }

      const { email, name, roleId, password } = createUserDto;

      // Concurrently check for existing user name and email
      const [existingName, existingEmail] = await Promise.all([
        this.userRepository.findOneBy({ name }),
        this.userRepository.findOneBy({ email })
      ]);

      // if (existingName) {
      //   throw new ConflictException('Name already exists.');
      // }
      if (existingEmail) {
        throw new ConflictException('Email already exists.');
      }

      // Fetch the role to determine if login is allowed
      const role = await this.roleRepository.findOneBy({ id: roleId });
      if (!role) {
        throw new ConflictException('Role does not exist.');
      }

      // Create new user with role
      const newUser = this.userRepository.create(createUserDto);
      newUser.role = role;

      newUser.password = await hashPassword(password); // Use bcrypt directly


      const savedUser = await this.userRepository.save(newUser);

      // Prepare userData for the email template
      // const userData = {
      //   name,
      //   email,
      //   password, // Plain text password for email notification
      //   role: role.name // Assuming the role object has a name property
      // };

      // Send email with login credentials
      // const emailSubject = `Account Created - ${name}`;
      // await pushMail(userData, "signup", emailSubject, email);

      return {
        statusCode: "00",
        message: 'User creation successful',
        data: { id: savedUser.id, name: savedUser.name, email: savedUser.email }
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async findAll(queryParams: FindAllQueryParamsDto) {
    try {
      const { id, name, role, email} = queryParams;
      let query = this.userRepository.createQueryBuilder('user');

      // Join the role relation to fetch role details
      query = query
        .leftJoin('user.role', 'role')
        .addSelect(['role.id', 'role.name'])

      // Dynamically build the query based on available query parameters
      if (id) {
        query = query.andWhere('user.id = :id', { id });
      }
      if (name) {
        query = query.andWhere('user.name = :name', { name });
      }
      if (role) {
        query = query.andWhere('role.id = :role', { role }); // Ensure you match by role ID or another unique identifier
      }
      if (email) {
        query = query.andWhere('user.email = :email', { email });
      }
 

      const user = await query.getMany();
      return {
        statusCode: "00",
        message: 'Fetch user successfully',
        data: user.map(s => ({
          id: s.id,
          name: s.name,
          email: s.email,
          createdAt: s.createdAt,
          role: s.role ? { 
            id: s.role.id,
            name: s.role.name,
            description: s.role.description,
          } : null
        }))
      };
    } catch (error) {
      console.error("Error occurred while fetching user:", error);
      throw error;
    }
  }

  async remove(id: string, req: Request): Promise<any> {
    try {

      const role = req?.decoded?.role; // Adjust if you access the user differently
      if (!['admin', 'lecturer'].includes(role)) {
        throw new ForbiddenException('You do not have permission to delete user.');
      }

      const user = await this.userRepository.findOneBy({ id });
      if (user == null || !user) {
        return new NotFoundException('user not found');
      }
      await this.userRepository.remove(user);
      return {
        statusCode: "00",
        message: 'Successfully deleted user',
        data: user
      }
    } catch (error) {
      console.error('Error occurred while remove user: ', error);
      throw error;
    }
  }

  async update(updateUserDto: UpdateUserDto, req: Request): Promise<any> {
    try {
      const role = req?.decoded?.role; // Adjust if you access the user differently
      if (!['admin', 'lecturer'].includes(role)) {
        throw new ForbiddenException('You do not have permission to update user.');
      }

      const { id } = updateUserDto;
      const existingUser = await this.userRepository.findOneBy({ id });
      if (!existingUser) {
        throw new NotFoundException(`User not found with ID: ${id}`);
      }

      // Map fields from DTO to the existing user entity
      const updatedUser = Object.assign(existingUser, updateUserDto);

      // Save the updated user
      const savedUser = await this.userRepository.save(updatedUser);

      return {
        statusCode: "00",
        message: 'Successfully updated user',
        data: savedUser,
      };
    } catch (error) {
      console.error('Error occurred while updating user: ', error);
      throw error;
    }
  }


  async validatePassword(plainPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    await this.userRepository.update({ id }, { password: newPassword });
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    try {
      const user = await this.userRepository.findOne({
        where: { email: username },
        relations: ['role'],
      });

      if (!user) {
        throw new BadRequestException("Incorrect username or password.");
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new BadRequestException("Incorrect username or password.");
      }

      if (!user.role) {
        throw new BadRequestException("user has no role assigned.");
      }

      const accessToken = sign(
        {
          email: user.email,
          userId: user.id,
          roleId: user.role.id,
          roleName: user.role.name,
          fullName: user.name
        },
        process.env.JWT_SECRET || "wb5Bx7U8bIKefg4PWBcNUoxibGFk92QY",
        {
          expiresIn: "1d",
        }
      );

      return {
        statusCode: "00",
        message: "Login Successful",
        data: {
          email: user.email,
          token: accessToken,
          userName: user.name,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const { id, oldPassword, newPassword } = changePasswordDto;

    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException('user not found');
      }

      const validPassword = await this.validatePassword(oldPassword, user.password);
      if (!validPassword) {
        throw new BadRequestException('Old password incorrect');
      }

      const hashedPassword = await hashPassword(newPassword);

      await this.updatePassword(id, hashedPassword);

      return {
        statusCode: "00",
        message: "Password Changed Successfully",
        data: {
          email: user.email,
          fullName: user.name
        }
      };
    } catch (error) {
      console.error("Error occurred while changing password: ", error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    try {

      const currentDate = new Date(); // Get the current date

      // Find the user with the given token
      const user = await this.userRepository.findOneBy({
        passwordResetToken: token,
        passwordResetExpires: LessThan(currentDate)
      });

      // Check if the user exists and the token is valid
      if (!user) {
        throw new NotFoundException('Token has expired or is invalid');
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Reset password and update token details
      await this.userRepository.update(
        { id: user.id },
        {
          password: hashedPassword,
          passwordReset: false,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      );

      // Fetch the updated user details
      const updatedUser = await this.userRepository.findOneBy({ id: user.id });

      return {
        statusCode: "00",
        message: 'Password Reset Successful',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.name,
          role: updatedUser.role,
          passwordReset: updatedUser.passwordReset,
        },
      };
    } catch (error) {
      console.error('Error occurred while resetting password:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<{ statusCode: string; message: string }> {
    try {
      // Get User based on provided email
      const user = await this.userRepository.findOneBy({ email });

      if (!user) {
        throw new NotFoundException('Email does not exist');
      }

      // Generate the random user reset token
      user.createPasswordResetToken();
      await this.userRepository.save(user);

      const { name } = user;

      // Send password reset email
      const emailSubject = 'Reset Password - ' + name;
      await pushMail(user, 'forgotpassword', emailSubject, email);

      return {
        statusCode: "00",
        message: 'Token sent to email',
        // passwordResetString: passwordResetToken
      };
    } catch (error) {
      console.error('Error occurred while changing password: ', error);
      throw error;
    }
  }
}
