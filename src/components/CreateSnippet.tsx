"use client";
import { trpc } from "@/app/_trpc/client";
import { CODE_SNIPPETS, TLanguages } from "@/constants";
import { SnippetValidation, TVisibility } from "@/lib/validations/snippet";
import { zodResolver } from "@hookform/resolvers/zod";
import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useTheme } from "next-themes";

const CreateSnippet = ({ userId }: { userId: string }) => {
  const [code, setCode] = useState<string | undefined>(
    CODE_SNIPPETS["javascript"]
  );
  const [currLanguage, setCurrLanguage] = useState("javascript");
  const editorRef = useRef();
  const router = useRouter();
  const { theme } = useTheme()

  const form = useForm({
    resolver: zodResolver(SnippetValidation),
    defaultValues: {
      code: CODE_SNIPPETS["javascript"],
      userId: userId,
      language: "javascript" as TLanguages,
      name: "",
      visibility: "public" as TVisibility,
    },
  });

  const onMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language: string) => {
    localStorage.setItem(currLanguage, code || "");
    setCurrLanguage(language);
    // @ts-ignore
    setCode(localStorage.getItem(language) || CODE_SNIPPETS[language]);
  };

  const { mutate: createSnippet, isPending } = trpc.createSnippet.useMutation({
    onSuccess: ({ snippet }) => {
      toast.success(`Code Snippet ${snippet.name} successfully created!`);
      router.push("/dashboard");
    },
    onError: (err) => {
      if (err?.data?.code === "UNAUTHORIZED") {
        toast.error("You must be logged in to create a snippet.", {
          action: {
            label: "Sign in",
            onClick: () => router.push("/sign-in"),
          },
        });
      } else {
        toast.error("Uh oh! Something went wrong", {
          description:
            "There was an error trying to create a snippet. Please try again.",
        });
      }
    },
  });

  const onSubmit = async (snippet: z.infer<typeof SnippetValidation>) => {
    createSnippet(snippet);
  };

  return (
    <div className="p-2.5 sm:p-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-y-3 sm:gap-y-0 items-end">
            <div className="flex gap-x-2 sm:gap-x-4 w-full">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-1/2 sm:w-[200px]">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem className="w-1/2 sm:w-[200px]">
                    <FormLabel>Language</FormLabel>
                    <Select
                      defaultValue="javascript"
                      onValueChange={(e) => {
                        onSelect(e);
                        field.onChange(e);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Languages</SelectLabel>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="css">CSS</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="csharp">C#</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="php">PHP</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem className="w-1/2 sm:w-[200px]">
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      defaultValue="public"
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Visibility</SelectLabel>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              className="w-full sm:w-fit flex items-center"
              disabled={isPending}
            >
              {isPending && (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-gray-200" />
              )}
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
          <div className="p-2 rounded-xl ring-1 ring-inset bg-gray-900/5 ring-gray-900/10 dark:bg-black/30 dark:ring-black lg:rounded-2xl mt-4 lg:p-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <Editor
                  height="75vh"
                  theme={theme === "dark" ? "vs-dark" : "light"}
                  language={currLanguage}
                  defaultValue={CODE_SNIPPETS["javascript"]}
                  value={code}
                  onChange={(e) => {
                    field.onChange(e);
                    setCode(e);
                  }}
                  onMount={onMount}
                />
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateSnippet;
