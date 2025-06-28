import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsArray, ArrayNotEmpty, IsInt, } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRoleDto {

  @ApiProperty({ description: 'Name' })
  @IsNotEmpty()
  @IsString()
  name: string;


  @ApiProperty({ description: 'description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Can Login', required: false })
  @IsOptional()
  @IsBoolean()
  isLogin?: boolean;

}


export class AssignPermissionsDto {
  @ApiProperty({
    type: [Number],
    example: [9, 10, 11, 12, 13],
    description: 'Array of permission IDs',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  permissionIds: number[];
}


export class FindAllQueryParamsDto {
  @ApiPropertyOptional({
    description: 'Id',
    type: String,
  })
  @IsOptional()
  //@IsString()
  id?: number;

  @ApiPropertyOptional({
    description: 'Filter by description',
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Filter by name',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;
}



