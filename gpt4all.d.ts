// gpt4all.d.ts
declare module 'gpt4all' {
    export interface GPT4AllOptions {
      model: string;
    }
  
    export class GPT4All {
      constructor(options: GPT4AllOptions);
      on(event: 'ready', listener: () => void): void;
      on(event: 'error', listener: (error: Error) => void): void;
      query(prompt: string): Promise<string>;
    }
  }
  