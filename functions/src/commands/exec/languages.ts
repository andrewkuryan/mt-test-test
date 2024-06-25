import { ExecutorProperties } from './service';

export interface ExecFile {
  name: string;
  content: string;
}

function buildFiles(
  code: string,
  wrapper: (code: string) => string,
  fileName: string,
  files: ExecFile[],
) {
  return [...(code.length > 0 ? [{ name: fileName, content: wrapper(code) }] : []), ...files];
}

export default {
  js: {
    name: 'JavaScript',
    buildOptions: (code: string, files: ExecFile[]) => ({
      language: 'nodejs',
      files: buildFiles(code, it => it, 'index.js', files),
    }),
  },
  kt: {
    name: 'Kotlin',
    buildOptions: (code: string, files: ExecFile[]) => ({
      language: 'kotlin',
      files: buildFiles(code, it => `fun main(args: Array<String>) { ${it} }`, 'main.kt', files),
    }),
  },
  java: {
    name: 'Java',
    buildOptions: (code: string, files: ExecFile[]) => ({
      language: 'java',
      files: buildFiles(
        code,
        it =>
          `import java.util.*; public class Main { public static void main(String[] args) { ${it} } }`,
        'Main.java',
        files,
      ),
    }),
  },
  py: {
    name: 'Python',
    buildOptions: (code: string, files: ExecFile[]) => ({
      language: 'python',
      files: buildFiles(code, it => it, 'main.py', files),
    }),
  },
  clj: {
    name: 'Clojure',
    buildOptions: (code: string, files: ExecFile[]) => ({
      language: 'clojure',
      files: buildFiles(code, it => it, 'main.clj', files),
    }),
  },
  c: {
    name: 'C',
    buildOptions: (code: string, files: ExecFile[]) => ({
      language: 'c',
      files: buildFiles(code, it => `#include <stdio.h>\n int main() { ${it} }`, 'main.c', files),
    }),
  },
  sh: {
    name: 'Bash',
    buildOptions: (code: string, files: ExecFile[]) => ({
      language: 'bash',
      files: buildFiles(code, it => it, 'main.sh', files),
    }),
  },
  sql: {
    name: 'MySQL',
    buildOptions: (code: string, files: ExecFile[]) => ({
      language: 'mysql',
      files: buildFiles(code, it => it, 'queries.sql', files),
    }),
  },
} as {
  [lang: string]: {
    name: string;
    buildOptions: (code: string, files: ExecFile[]) => ExecutorProperties;
  };
};
