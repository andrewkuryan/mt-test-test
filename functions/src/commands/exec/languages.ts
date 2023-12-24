import { ExecutorProperties } from './service';

export default {
  js: {
    name: 'JavaScript',
    buildOptions: (code: string) => ({
      language: 'nodejs',
      files: [{ name: 'index.js', content: code }],
    }),
  },
  kt: {
    name: 'Kotlin',
    buildOptions: (code: string) => ({
      language: 'kotlin',
      files: [{ name: 'HelloWorld.kt', content: `fun main(args: Array<String>) { ${code} }` }],
    }),
  },
  java: {
    name: 'Java',
    buildOptions: (code: string) => ({
      language: 'java',
      files: [
        {
          name: 'Main.java',
          content: `import java.util.*; public class Main { public static void main(String[] args) { ${code} } }`,
        },
      ],
    }),
  },
  py: {
    name: 'Python',
    buildOptions: (code: string) => ({
      language: 'python',
      files: [{ name: 'main.py', content: code }],
    }),
  },
  clj: {
    name: 'Clojure',
    buildOptions: (code: string) => ({
      language: 'clojure',
      files: [{ name: 'HelloWorld.clj', content: code }],
    }),
  },
  c: {
    name: 'C',
    buildOptions: (code: string) => ({
      language: 'c',
      files: [
        {
          name: 'Main.c',
          content: `#include <stdio.h>\n int main() { ${code} }`,
        },
      ],
    }),
  },
  sh: {
    name: 'Bash',
    buildOptions: (code: string) => ({
      language: 'bash',
      files: [{ name: 'HelloWorld.sh', content: code }],
    }),
  },
  sql: {
    name: 'MySQL',
    buildOptions: (code: string) => ({
      language: 'mysql',
      files: [{ name: 'queries.sql', content: code }],
    }),
  },
} as {
  [lang: string]: {
    name: string;
    buildOptions: (code: string) => ExecutorProperties;
  };
};
