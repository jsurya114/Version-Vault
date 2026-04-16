import { injectable } from 'tsyringe';
import { IGroqService, Message } from '../../domain/interfaces/services/IGroqService';
import Groq from 'groq-sdk';
import { envConfig } from '../../shared/config/env.config';

@injectable()
export class GroqService implements IGroqService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({ apiKey: envConfig.GROQ_API_KEY });
  }
  async chat(messages: Message[], jsonMode?: boolean): Promise<string> {
    const response = await this.groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant',
      response_format: jsonMode ? { type: 'json_object' } : undefined,
    });
    return response.choices[0]?.message.content || '';
  }
}
