import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto, FindAllQueryParamsDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { In, Repository } from 'typeorm';
import { Request } from 'express';


@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) { }


  async create(createRoleDto: CreateRoleDto, req: Request): Promise<any> {
    try {

      const existingName = await this.roleRepository.findOneBy({ name: createRoleDto.name });
      if (existingName) {
        throw new ConflictException('Name already exists.');
      }
      const newRequest = this.roleRepository.create(createRoleDto);
      const savedRole = await this.roleRepository.save(newRequest);
      return {
        statusCode: "00",
        message: 'Role creation successful',
        data: savedRole
      }
    } catch (error) {
      console.log("Error occurred while creating role: ", error);
      throw error;
    }
  }

  async findAll(queryParams: FindAllQueryParamsDto) {
    try {
      const { id, description, name } = queryParams;
      let query = this.roleRepository.createQueryBuilder('role');

      // Dynamically build the query based on available query parameters
      if (id) {
        query = query.andWhere('role.id = :id', { id });
      }

      if (description) {
        query = query.andWhere('role.description = :description', { description });
      }

      if (name) {
        query = query.andWhere('role.name = :name', { name });
      }

      const roles = await query.getMany();
      return {
        statusCode: "00",
        message: 'Fetch roles successfully',
        data: roles,
      };
    } catch (error) {
      console.error("Error occurred while fetching roles:", error);
      throw error;
    }
  }


  async remove(id: number, req: Request): Promise<any> {
    try {


      const role = await this.roleRepository.findOneBy({ id });
      if (role == null || !role) {
        return new NotFoundException('role not found');
      }
      await this.roleRepository.remove(role);
      return {
        statusCode: "00",
        message: 'Successfully deleted role',
        data: role
      }
    } catch (error) {
      console.error('Error occurred while remove role: ', error);
      throw error;
    }
  }


  async update(updateRoleDto: UpdateRoleDto, req: Request): Promise<any> {
    try {

      const permissions = req?.decoded?.permissions; // Adjust if you access the user differently
      if (!permissions?.includes('can_update_role')) {
        throw new ForbiddenException('You do not have permission to update role.');
      }

      const { id, name, description } = updateRoleDto
      const existingRole = await this.roleRepository.findOneBy({ id: id });
      if (!existingRole) {
        throw new NotFoundException(`Role not found`);
      }

      const updateRequest = {
        ...existingRole,
        name,
        description
      };
      const savedRequest = await this.roleRepository.save(updateRequest);
      return {
        statusCode: "00",
        message: 'Successfully Updated role',
        data: savedRequest
      }
    } catch (error) {
      console.error('Error occurred while update role: ', error);
      throw error;
    }

  }


}
