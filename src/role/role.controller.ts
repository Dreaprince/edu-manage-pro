import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, Put } from '@nestjs/common';
import { RoleService } from './role.service';
import { AssignPermissionsDto, CreateRoleDto, FindAllQueryParamsDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Request } from 'express';
import { ApiSecurity } from '@nestjs/swagger';



@ApiSecurity('auth-token')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }


  @Post('/register')
  create(@Body() createRoleDto: CreateRoleDto, @Req() req: Request) {
    try {
      return this.roleService.create(createRoleDto, req);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  findAll(@Query() queryParams: FindAllQueryParamsDto) {
    try {
      return this.roleService.findAll(queryParams);
    } catch (error) {
      throw error;
    }
  }


  @Patch('/update')
  update(@Body() updateRoleDto: UpdateRoleDto, @Req() req: Request) {
    try {
      return this.roleService.update(updateRoleDto, req);
    } catch (error) {
      throw error;
    }
  }


  @Delete('/:id')
  remove(@Param('id') id: number, @Req() req: Request) {
    try {
      return this.roleService.remove(id, req);
    } catch (error) {
      throw error;
    }
  }


  @Put('/:roleId/assign-permissions')
  async assignPermissions(
    @Param('roleId') roleId: number,
    @Body() assignPermissionsDto: AssignPermissionsDto,  // Expecting an array of permission IDs
    @Req() req: Request
  ) {
    try {
      const { permissionIds } = assignPermissionsDto;
      return this.roleService.assignPermissions(roleId, permissionIds, req);
    } catch (error) {
      throw error;
    }

  }

  @Delete('/:roleId/remove-permissions')
  async removePermissions(
    @Param('roleId') roleId: number,
    @Body() permissionIds: number[],  // Expecting an array of permission IDs
    @Req() req: Request
  ) {
    try {
      return this.roleService.removePermissions(roleId, permissionIds, req);
    } catch (error) {
      throw error;
    }

  }
}
