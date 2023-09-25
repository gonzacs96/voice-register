import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddUserToProjectDTO } from 'src/dtos/addUserToProject.dto';
import { CreateUserProjectDTO } from 'src/dtos/createUserProject.dto';
import { PartialProjectResponseDTO } from 'src/dtos/responses/partialProject.response.dto';
import { ProjectResponseDTO } from 'src/dtos/responses/project.response.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UserProjectsService } from 'src/services/userProjects.service';
import { TokenPayload } from 'src/types/token-payload.type';
import { UserProject } from 'src/entities/userProject.entity';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { MoveResultsToProjectDTO } from 'src/dtos/moveResultsToProject.dto';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('project')
export class UserProjectsController {
  constructor(private readonly userProjectsService: UserProjectsService) {}

  @ApiOperation({ summary: 'Create project' })
  @ApiResponse({ type: ProjectResponseDTO, status: 201 })
  @UseInterceptors(new TransformInterceptor(ProjectResponseDTO))
  @Post()
  async createUserProject(
    @Body() createUserProjectDTO: CreateUserProjectDTO,
    @Req() req: { user: TokenPayload },
  ): Promise<UserProject> {
    return await this.userProjectsService.createUserProject(createUserProjectDTO, req.user);
  }

  @ApiOperation({ summary: 'Get projects' })
  @ApiResponse({ type: PartialProjectResponseDTO, status: 200, isArray: true })
  @UseInterceptors(new TransformInterceptor(PartialProjectResponseDTO))
  @Get()
  async getUserProjects(@Req() req: { user: TokenPayload }): Promise<Array<UserProject>> {
    return await this.userProjectsService.getUserProjects(req.user);
  }

  @ApiOperation({ summary: 'Get project' })
  @ApiResponse({ type: ProjectResponseDTO, status: 200 })
  @UseInterceptors(new TransformInterceptor(ProjectResponseDTO))
  @Get(':id')
  async getUserProject(@Param('id') id: string, @Req() req: { user: TokenPayload }): Promise<UserProject> {
    return await this.userProjectsService.getUserProject(id, req.user);
  }

  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ type: ProjectResponseDTO, status: 200 })
  @UseInterceptors(new TransformInterceptor(ProjectResponseDTO))
  @Delete(':id')
  async deleteUserProject(
    @Param('id') id: string,
    @Req() req: { user: TokenPayload },
  ): Promise<UserProject> {
    return await this.userProjectsService.deleteUserProject(id, req.user);
  }

  @ApiOperation({ summary: 'Add user to project' })
  @ApiResponse({ type: ProjectResponseDTO, status: 200 })
  @UseInterceptors(new TransformInterceptor(ProjectResponseDTO))
  @Patch(':id')
  async addUserToProject(
    @Body() addUserToProject: AddUserToProjectDTO,
    @Param('id') id: string,
    @Req() req: { user: TokenPayload },
  ): Promise<UserProject> {
    return await this.userProjectsService.addUserToProject(addUserToProject, id, req.user);
  }

  @ApiOperation({ summary: 'Move results to project' })
  @ApiResponse({ type: ProjectResponseDTO, status: 200 })
  @UseInterceptors(new TransformInterceptor(ProjectResponseDTO))
  @Patch(':id/result')
  async moveResultsToProject(
    @Body() moveResultsToProjectDTO: MoveResultsToProjectDTO,
    @Param('id') id: string,
    @Req() req: { user: TokenPayload },
  ): Promise<UserProject> {
    return await this.userProjectsService.moveResultsToProject(moveResultsToProjectDTO, id, req.user);
  }
}
