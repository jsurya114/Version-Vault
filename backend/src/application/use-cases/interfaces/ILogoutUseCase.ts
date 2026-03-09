export interface IlogoutUseCase {
  execute(refresToken: string): Promise<{ message: string }>;
}
