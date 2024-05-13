"use client";
import { trpc } from "@/app/_trpc/client";
import {
  TVisibility,
  UpdateSnippetValidation,
} from "@/lib/validations/snippet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Editor } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import { notFound, redirect, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
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
import { Label } from "./ui/label";
import { LANGUAGES } from "@/constants";

interface EditSnippetProps {
  loggedInUserId: string;
  snippetId: string;
}

const EditSnippet = ({ loggedInUserId, snippetId }: EditSnippetProps) => {
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [code, setCode] = useState<string | undefined>("");
  const editorRef = useRef();
  const router = useRouter();

  const { data, isLoading } = trpc.getSnippet.useQuery({
    id: snippetId,
  });

  let snippet = null;
  if (data && data.success) snippet = data?.snippet;

  if (snippet?.visibility === "private" && snippet.userId !== loggedInUserId)
    redirect("/dashboard");

  const onMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };

  const { mutate: updateSnippet, isPending } = trpc.updateSnippet.useMutation({
    onSuccess: ({ updatedSnippet }) => {
      toast.success(
        `Code Snippet ${updatedSnippet.name} successfully updated!`
      );
    },
    onError: (err) => {
      if (err?.data?.code === "UNAUTHORIZED") {
        toast.error("You must be logged in to edit a snippet.", {
          action: {
            label: "Sign in",
            onClick: () => router.push("/sign-in"),
          },
        });
      } else {
        toast.error("Uh oh! Something went wrong", {
          description:
            "There was an error trying to edit your snippet. Please try again.",
        });
      }
    },
  });

  const onVisibilitySelect = (visibility: string) => {
    setVisibility(visibility);
  };

  useEffect(() => {
    if (snippet) {
      setName(snippet.name);
      setVisibility(snippet.visibility);
      setCode(snippet.code);
    }
  }, [snippet]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // updateSnippet({ id: snippetId, data: updatedSnippet });
    const {
      code: updatedCode,
      name: updatedName,
      visibility: updatedVisibility,
    } = UpdateSnippetValidation.parse({
      code,
      name,
      visibility,
    });

    const updatedSnippet = {
      code: updatedCode,
      name: updatedName,
      visibility: updatedVisibility,
    };

    updateSnippet({
      id: snippetId,
      data: updatedSnippet,
    });
  };

  if (isLoading) return <EditSnippetPlaceholder />;

  if (!snippet) return notFound();

  if (snippet.userId !== loggedInUserId) redirect("/");

  if (!isLoading && snippet) {
    return (
      <div className="p-2.5 sm:p-0">
        <form onSubmit={(e) => onSubmit(e)}>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-y-3 sm:gap-y-0 items-end">
            <div className="flex gap-x-2 sm:gap-x-4 w-full">
              <div className="w-1/2 sm:w-[200px] space-y-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  type="text"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="w-1/2 sm:w-[200px] space-y-3">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  disabled
                  // @ts-ignore
                  value={LANGUAGES[snippet.language]}
                />
              </div>
              <div className="w-1/2 sm:w-[200px] space-y-3">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  defaultValue={snippet.visibility}
                  onValueChange={(e) => onVisibilitySelect(e)}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue
                      id="visibility"
                      placeholder="Select a language"
                    />
                  </SelectTrigger>
                  <SelectContent id="visibility">
                    <SelectGroup>
                      <SelectLabel>Visibility</SelectLabel>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
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
            <Editor
              height="75vh"
              language={snippet.language}
              defaultValue={code}
              value={code}
              onChange={(e) => {
                setCode(e);
              }}
              onMount={onMount}
            />
          </div>
        </form>
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
