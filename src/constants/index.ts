import { TVisibility } from "@/lib/validations/snippet";

export const LANGUAGES = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  csharp: "C#",
  java: "Java",
  php: "PHP",
};

export type TLanguages =
  | "javascript"
  | "typescript"
  | "python"
  | "csharp"
  | "java"
  | "php";

export const CODE_SNIPPETS = {
  javascript: `// sample snippet\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
  typescript: `// sample snippet\ntype Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Alex" });\n`,
  python: `# sample snippet\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
  java: `// sample snippet\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
  csharp:
    '// sample snippet\nusing System;\n\nnamespace HelloWorld\n{\n\tclass Hello { \n\t\tstatic void Main(string[] args) {\n\t\t\tConsole.WriteLine("Hello World in C#");\n\t\t}\n\t}\n}\n',
  php: "//sample snippet\n<?php\n\n$name = 'Alex';\necho $name;\n",
};

export const INFINITE_QUERY_LIMIT = 9;

export type TSnippet = {
  code: string;
  userId: string;
  user: {
    picture: string | null;
    id: string;
    name: string | null;
    email: string;
  };
  id: string;
  name: string;
  language: string;
  visibility: TVisibility;
  createdAt: string;
  updatedAt: string;
};
