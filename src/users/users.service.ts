import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, FindAllQueryParamsDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { hashPassword, makeid } from 'src/auth/utility';
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
      const roleCheck = req?.decoded?.role; // Adjust if you access the user differently
      if (!['admin', 'lecturer'].includes(roleCheck)) {
        throw new ForbiddenException('You do not have permission to delete user.');
      }

      const { email, name, roleId } = createUserDto;

      // Concurrently check for existing staff name and email
      const [existingName, existingEmail] = await Promise.all([
        this.userRepository.findOneBy({ name }),
        this.userRepository.findOneBy({ email })
      ]);

      if (existingName) {
        throw new ConflictException('Name already exists.');
      }
      if (existingEmail) {
        throw new ConflictException('Email already exists.');
      }

      // Fetch the role to determine if login is allowed
      const role = await this.roleRepository.findOneBy({ id: roleId });
      if (!role) {
        throw new ConflictException('Role does not exist.');
      }

      // Create new staff with role
      const newUser = this.userRepository.create(createUserDto);
      newUser.role = role;

      let password;

      // Handle password assignment if applicable
      if (role.isLogin) {
        password = makeid(8); // Ensure this method exists or create it
        newUser.password = await hashPassword(password); // Use bcrypt directly

        // Consider creating and assigning an access token here if needed
      }

      const savedUser = await this.userRepository.save(newUser);

      // Prepare userData for the email template
      const userData = {
        name,
        email,
        password, // Plain text password for email notification
        role: role.name // Assuming the role object has a name property
      };

      // Send email with login credentials
      const emailSubject = `Account Created - ${name}`;
      await pushMail(userData, "signup", emailSubject, email);

      return {
        statusCode: "00",
        message: 'Staff creation successful',
        data: { id: savedUser.id, staffName: savedUser.staffName, email: savedUser.email }
      };
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  }

  async findAll(queryParams: FindAllQueryParamsDto) {
    try {
      const { id, name, lga, role, email, phoneNumber } = queryParams;
      let query = this.userRepository.createQueryBuilder('user');

      // Join the role relation to fetch role details
      query = query
        .leftJoin('staff.role', 'role')
        .addSelect(['role.id', 'role.name'])

      // Dynamically build the query based on available query parameters
      if (id) {
        query = query.andWhere('staff.id = :id', { id });
      }
      if (name) {
        query = query.andWhere('staff.name = :name', { name });
      }
      if (lga) {
        query = query.andWhere('staff.lga = :lga', { lga });
      }
      if (role) {
        query = query.andWhere('role.id = :role', { role }); // Ensure you match by role ID or another unique identifier
      }
      if (email) {
        query = query.andWhere('staff.email = :email', { email });
      }
      if (phoneNumber) {
        query = query.andWhere('staff.phoneNumber = :phoneNumber', { phoneNumber });
      }

      const staff = await query.getMany();
      return {
        statusCode: "00",
        message: 'Fetch staff successfully',
        data: staff.map(s => ({
          id: s.id,
          name: s.name,
          address: s.address,
          lga: s.lga,
          stateOfOrigin: s.stateOfOrigin,
          country: s.country,
          email: s.email,
          phoneNumber: s.phoneNumber,
          createdAt: s.createdAt,
          role: s.role ? { // Add role details to the response
            id: s.role.id,
            name: s.role.name,
            description: s.role.description,
            isLogin: s.role.isLogin
          } : null
        }))
      };
    } catch (error) {
      console.error("Error occurred while fetching staff:", error);
      throw error;
    }
  }

  async remove(id: number, req: Request): Promise<any> {
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
        throw new ForbiddenException('You do not have permission to upsate user.');
      }

      const { id } = updateUserDto;
      const existingUser = await this.userRepository.findOneBy({ id });
      if (!existingUser) {
        throw new NotFoundException(`Staff not found with ID: ${id}`);
      }

      // Map fields from DTO to the existing staff entity
      const updatedUser = await this.userRepository.save({
        ...existingUser,
        ...updateUserDto // Spread the update DTO to overwrite existing fields
      });

      return {
        statusCode: "00",
        message: 'Successfully updated staff',
        data: updatedUser
      };
    } catch (error) {
      console.error('Error occurred while updating staff: ', error);
      throw error;
    }
  }

  async validatePassword(plainPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
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
          phoneNumber: user.phoneNumber,
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
          fullName: user.name,
          phoneNumber: user.phoneNumber
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
      const updatedUser = await this.userRepository.findOneBy({ id: staff.id });

      return {
        statusCode: "00",
        message: 'Password Reset Successful',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.name,
          role: updatedUser.role,
          phoneNumber: updatedUser.phoneNumber,
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
