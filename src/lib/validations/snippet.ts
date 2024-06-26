import * as z from "zod";

export const SnippetValidation = z.object({
  code: z.string().min(3, { message: "Minimum 3 characters" }),
  name: z
    .string()
    .min(3, { message: "Minimum 3 characters" })
    .max(25, { message: "Maximum 25 characters" }),
  description: z
    .string()
    .max(150, { message: "Maximum 150 characters" })
    .optional(),
  language: z.enum([
    "javascript",
    "typescript",
    "html",
    "css",
    "python",
    "csharp",
    "java",
    "php",
  ]),
  userId: z.string(),
  visibility: z.enum(["public", "private"]),
});

export const UpdateSnippetValidation = z.object({
  code: z.string().min(3, { message: "Minimum 3 characters" }),
  name: z
    .string()
    .min(3, { message: "Minimum 3 characters" })
    .max(25, { message: "Maximum 25 characters" }),
  description: z
    .string()
    .max(150, { message: "Maximum 150 characters" })
    .optional(),
  visibility: z.enum(["public", "private"]),
});

export type TVisibility = "public" | "private";
