export interface IGetLatestWorkflowStatusUseCase {
  execute(
    repositoryId: string,
  ): Promise<{ status: string; commitHash: string; createdAt: Date } | null>;
}
