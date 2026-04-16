export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface IGroqService {
  chat(messages: Message[], jsonMode?: boolean): Promise<string>;
}
