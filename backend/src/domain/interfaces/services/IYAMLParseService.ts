import { IWorkflow } from '../ICICD';
export interface IYAMLParserService {
  parse(yamlString: string): IWorkflow;
}
