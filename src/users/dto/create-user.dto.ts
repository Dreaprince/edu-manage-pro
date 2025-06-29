import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString} from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ description: ' Name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Email' })
    @IsNotEmpty()
    @IsEmail()
    email: string;


    @ApiProperty({ description: 'Role ID', required: false })
    @IsOptional()
    @IsNumber()
    roleId?: number;

    @ApiProperty({ description: 'Password Hash', required: false })
    @IsOptional()
    @IsString()
    password?: string;
}


export class FindAllQueryParamsDto {
  @ApiPropertyOptional({
    description: 'Filter by staff name',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by email address',
    type: String,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter by User ID',
    type: Number,
  })
  @IsOptional()
  //@IsNumber()
  id?: number;

  @ApiPropertyOptional({
    description: 'Filter by role',
    type: String,
  })
  @IsOptional()
  @IsString()
  role?: string;
}



