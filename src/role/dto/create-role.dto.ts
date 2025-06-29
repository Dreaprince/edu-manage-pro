import { IsBoolean, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class CreateRoleDto {

  @ApiProperty({ description: 'Name' })
  @IsNotEmpty()
  @IsString()
  name: string;


  @ApiProperty({ description: 'description' })
  @IsNotEmpty()
  @IsString()
  description: string;

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



