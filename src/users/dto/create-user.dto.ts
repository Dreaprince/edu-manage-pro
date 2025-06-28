import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString} from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ description: ' Name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Address' })
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({ description: 'Local Government Area' })
    @IsNotEmpty()
    @IsString()
    lga: string;

    @ApiProperty({ description: 'State of Origin' })
    @IsNotEmpty()
    @IsString()
    stateOfOrigin: string;

    @ApiProperty({ description: 'Country' })
    @IsNotEmpty()
    @IsString()
    country: string;

    @ApiProperty({ description: 'Email' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Phone Number' })
    @IsNotEmpty()
    @IsPhoneNumber('NG')
    phoneNumber: string;


    @ApiProperty({ description: 'Created By', required: false })
    @IsOptional()
    @IsNumber()
    createdBy?: number;

    @ApiProperty({ description: 'Role ID', required: false })
    @IsOptional()
    @IsNumber()
    roleId?: number;

    // @ApiProperty({ description: 'Password Hash', required: false })
    // @IsOptional()
    // @IsString()
    // passwordHash?: string;
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
    description: 'Filter by local government area (LGA)',
    type: String,
  })
  @IsOptional()
  @IsString()
  lga?: string;

  @ApiPropertyOptional({
    description: 'Filter by email address',
    type: String,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter by phone number',
    type: String,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

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



