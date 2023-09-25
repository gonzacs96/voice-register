import { Project } from 'src/entities/project.entity';
import { Result } from 'src/entities/result.entity';
import { TranscriptVersion } from 'src/entities/transcriptVersion.entity';
import { User } from 'src/entities/user.entity';
import { UserProject } from 'src/entities/userProject.entity';

export type VoiceRegisterEntity = Result | UserProject | User | Project | TranscriptVersion;

export const entities = [Result, UserProject, User, Project, TranscriptVersion];
