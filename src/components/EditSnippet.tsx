"use client";
import { trpc } from "@/app/_trpc/client";
import { TLanguages } from "@/constants";
import {
  TVisibility,
  UpdateSnippetValidation,
} from "@/lib/validations/snippet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import { notFound, redirect, useRouter } from "next/navigation";
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
import { Skeleton } from "./ui/skeleton";

interface EditSnippetProps {
  loggedInUserId: string;
  snippetId: string;
}

const EditSnippet = ({ loggedInUserId, snippetId }: EditSnippetProps) => {
  const editorRef = useRef();
  const router = useRouter();

  const { data, isLoading } = trpc.getSnippet.useQuery({
    id: snippetId,
  });

  let snippet;
  if (data && data.success) snippet = data?.snippet;

  if (snippet?.visibility === "private" && snippet.userId !== loggedInUserId)
    redirect("/dashboard");

  const [code, setCode] = useState<string | undefined>(snippet?.code);

  const form = useForm({
    resolver: zodResolver(UpdateSnippetValidation),
    defaultValues: {
      code: snippet?.code || "",
      name: snippet?.name || "",
      visibility: snippet?.visibility as TVisibility,
      language: snippet?.language as TLanguages,
    },
  });

  const onMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };

  const { mutate: updateSnippet, isPending } = trpc.updateSnippet.useMutation({
    onSuccess: ({ updatedSnippet }) => {
      toast.success(
        `Code Snippet ${updatedSnippet.name} successfully updated!`
      );
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

  const onSubmit = async (
    updatedSnippet: z.infer<typeof UpdateSnippetValidation>
  ) => {
    updateSnippet({ id: snippetId, data: updatedSnippet });
  };

  if (isLoading) return <EditSnippetPlaceholder />;

  if (!snippet) return notFound();

  if (snippet.userId !== loggedInUserId) redirect("/");

  if (!isLoading && snippet) {
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
                      <Select defaultValue={snippet?.language} disabled>
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Languages</SelectLabel>
                            <SelectItem value="javascript">
                              JavaScript
                            </SelectItem>
                            <SelectItem value="typescript">
                              TypeScript
                            </SelectItem>
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
            <div className="p-2 rounded-xl ring-1 ring-inset bg-gray-900/5 ring-gray-900/10 lg:rounded-2xl mt-4 lg:p-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <Editor
                    height="75vh"
                    language={snippet.language}
                    defaultValue={snippet.code}
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
  }
};

const EditSnippetPlaceholder = () => {
  return (
    <div className="p-2.5 sm:p-0 mt-6">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-y-3 sm:gap-y-0 items-end">
        <div className="flex gap-x-2 sm:gap-x-4 w-full">
          <Skeleton className="bg-zinc-300 h-10 w-1/2 sm:w-[200px]" />
          <Skeleton className="bg-zinc-300 h-10 w-1/2 sm:w-[200px]" />
          <Skeleton className="bg-zinc-300 h-10 w-1/2 sm:w-[200px]" />
        </div>
        <Skeleton className="bg-zinc-300 h-10 w-16" />
      </div>
      <div className="mt-4">
        <Skeleton className="bg-zinc-300 h-[700px] w-full" />
      </div>
    </div>
  );
};

export default EditSnippet;
