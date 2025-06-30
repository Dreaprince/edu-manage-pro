
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetEnrollmentsDto {
    @ApiProperty({ description: 'status' , required: false })
    @IsOptional()
    @IsString()
    status?: string; 
}



