import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto, FindAllQueryParamsDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { In, Repository } from 'typeorm';
import { Request } from 'express';
import { Permission } from 'src/permissions/entities/permission.entity';


@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) { }


  async create(createRoleDto: CreateRoleDto, req: Request): Promise<any> {
    try {

      const permissions = req?.decoded?.permissions; // Adjust if you access the user differently
      if (!permissions?.includes('can_create_role')) {
        throw new ForbiddenException('You do not have permission to create role.');
      }

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

      // Load the permissions associated with the role
      query = query
        .leftJoin('role.permissions', 'permission')
        .addSelect(['permission.name'])

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
      const permissions = req?.decoded?.permissions; // Adjust if you access the user differently
      if (!permissions?.includes('can_delete_role')) {
        throw new ForbiddenException('You do not have permission to delete role.');
      }


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

  async assignPermissions(roleId: number, permissionIds: number[], req: Request): Promise<any> {
    try {
      const permissionsFromRequest = req?.decoded?.permissions;
      if (!permissionsFromRequest?.includes('can_assign_permissions')) {
        throw new ForbiddenException('You do not have permission to assign permissions.');
      }

      const role = await this.roleRepository.findOne({
        where: { id: roleId },
        relations: ['permissions'],  // Make sure to load the permissions relationship
      });
      if (!role) {
        throw new NotFoundException('Role not found');
      }

      // Assign the permissions to the role
      const permissions = await this.permissionRepository.findBy({
        id: In(permissionIds),  // Use the In operator to fetch multiple permissions
      });
      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException('Some permissions not found');
      }

      // Add the permissions to the role
      permissions.forEach(permission => {
        permission.role = role;  // Associate permission with the role
      });

      await this.permissionRepository.save(permissions);  // Save the permissions

      return {
        statusCode: '00',
        message: 'Permissions assigned successfully',
        data: role,
      };
    } catch (error) {
      console.error('Error occurred while assigning permissions:', error);
      throw error;
    }
  }

  async removePermissions(roleId: number, permissionIds: number[], req: Request): Promise<any> {
    try {
      const permissionsFromRequest = req?.decoded?.permissions;
      if (!permissionsFromRequest?.includes('can_remove_permissions')) {
        throw new ForbiddenException('You do not have permission to remove permissions.');
      }

      const role = await this.roleRepository.findOne({
        where: { id: roleId },
        relations: ['permissions'],  // Load the permissions relationship
      });
      if (!role) {
        throw new NotFoundException('Role not found');
      }

      // Find the permissions to remove
      const permissions = await this.permissionRepository.findByIds(permissionIds);
      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException('Some permissions not found');
      }

      // Remove the role association from the permissions
      permissions.forEach(permission => {
        permission.role = null;  // Dissociate permission from the role
      });

      await this.permissionRepository.save(permissions);  // Save the updated permissions

      return {
        statusCode: '00',
        message: 'Permissions removed successfully',
        data: role,
      };
    } catch (error) {
      console.error('Error occurred while removing permissions:', error);
      throw error;
    }
  }


}
