import { injectable } from 'tsyringe';
import * as yaml from 'yaml';
import { IWorkflow, IWorkflowJob, IWorkflowStep } from '../../../domain/interfaces/ICICD';
import { IYAMLParserService } from '../../../domain/interfaces/services/IYAMLParseService';
@injectable()
export class YAMLParserService implements IYAMLParserService {
  parse(yamlString: string): IWorkflow {
    try {
      const parsed = yaml.parse(yamlString);

      // Basic validation to ensure the user didn't write garbage YAML
      if (!parsed.jobs || !parsed.name) {
        throw new Error("Invalid workflow file: Missing 'name' or 'jobs'");
      }

      // Map YAML keys (runs-on) to TypeScript interface keys (runsOn)
      const jobs: Record<string, IWorkflowJob> = {};

      const rawJobs = (parsed.jobs || {}) as Record<string, Record<string, unknown>>;

      for (const [jobName, jobDef] of Object.entries(rawJobs)) {
        jobs[jobName] = {
          name: (jobDef.name as string) || jobName,
          runsOn: (jobDef['runs-on'] as string) || (jobDef.runsOn as string) || 'ubuntu:latest',
          steps: (jobDef.steps as IWorkflowStep[]) || [],
        };
      }

      return {
        name: parsed.name as string,
        on: Array.isArray(parsed.on) ? (parsed.on as string[]) : [parsed.on as string],
        jobs,
      } as IWorkflow;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse workflow YAML: ${errorMessage}`, { cause: error });
    }
  }
}
