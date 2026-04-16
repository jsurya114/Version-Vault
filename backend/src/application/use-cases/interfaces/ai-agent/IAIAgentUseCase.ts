import {
  AIAgentResponse,
  ProjectConfigDTO,
} from '../../../../application/dtos/user/AIAgentResponse';

export interface IAIAgentUseCase {
  execute(
    config: ProjectConfigDTO,
    ownerId: string,
    ownerUsername: string,
  ): Promise<AIAgentResponse>;
}
