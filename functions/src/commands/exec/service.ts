import fetch from 'cross-fetch';

export interface ExecutorProperties {
  language: string;
  files: Array<{
    name: string;
    content: string;
  }>;
}

export interface ExecutorOptions {
  properties: ExecutorProperties;
}

export interface ExecutorResponse {
  stdout: string | null;
  stderr: string | null;
  executionTime: number;
}

export async function execCode(options: ExecutorOptions): Promise<ExecutorResponse> {
  const response = await fetch('https://onecompiler.com/api/code/exec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });
  return (await response.json()) as ExecutorResponse;
}
