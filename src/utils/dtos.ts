import { PartialProjectResponseDTO } from 'src/dtos/responses/partialProject.response.dto';
import { ProjectResponseDTO } from 'src/dtos/responses/project.response.dto';
import { PartialResultResponseDTO } from 'src/dtos/responses/partialResult.response.dto';
import { ResultResponseDTO } from 'src/dtos/responses/result.response.dto';
import { TranscriptVersionResponseDTO } from 'src/dtos/responses/transcriptVersion.response.dto';
import { TranscriptResponseDTO } from 'src/dtos/responses/transcript.response.dto';

export type VoiceRegisterResponseDTO =
  | PartialResultResponseDTO
  | ProjectResponseDTO
  | PartialProjectResponseDTO
  | ResultResponseDTO
  | TranscriptVersionResponseDTO
  | TranscriptResponseDTO;
