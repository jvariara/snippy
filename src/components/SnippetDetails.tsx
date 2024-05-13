"use client";
import Image from "next/image";
import CodeSection from "./CodeSection";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Heart, PlusCircleIcon } from "lucide-react";
import { format } from "date-fns";
import { trpc } from "@/app/_trpc/client";
import { formatSaveCount } from "@/lib/utils";
import { LANGUAGES } from "@/constants";
import { notFound, redirect } from "next/navigation";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface SnippetDetailsProps {
  snippetId: string;
  loggedInUserId: string;
}

const SnippetDetails = ({ snippetId, loggedInUserId }: SnippetDetailsProps) => {
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.getSnippet.useQuery({
    id: snippetId,
  });

  let snippet;
  if (data && data.success) snippet = data?.snippet;

  if (snippet?.visibility === "private" && snippet.userId !== loggedInUserId)
    redirect("/snippets");

  const { mutate: saveSnippet } = trpc.saveSnippet.useMutation({
    onSuccess: () => {
      utils.getSnippetSaveCount.invalidate();
      utils.isSnippetSaved.invalidate();
    },
  });

  const { data: saveCount } = trpc.getSnippetSaveCount.useQuery({
    snippetId: snippetId,
  });

  const { data: isSaved } = trpc.isSnippetSaved.useQuery({
    snippetId: snippetId,
  });

  if (isLoading) return <SnippetPlaceholder />;

  if (!snippet) return notFound();

  if (!isLoading && snippet) {
    return (
      <div className="max-w-6xl mx-auto gap-6 pb-24 sm:pb-32 lg:gap-x-8 lg:px-8 lg:py-20">
        <div className="w-full flex items-start flex-col-reverse lg:flex-row gap-x-6 gap-y-4 mt-12 px-4">
          <div className="max-w-2xl w-full text-left p-5 bg-primary/90 rounded-xl shadow">
            <CodeSection code={snippet.code} />
          </div>
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-x-2">
              <h3 className="text-md sm:text-lg text-muted-foreground">
                Snippet by{" "}
                <span className="font-medium text-lg sm:text-xl text-primary">
                  {snippet.user.name}
                </span>
              </h3>
              <Avatar className="relative w-10 h-10">
                {snippet.user.picture ? (
                  <div className="relative aspect-square h-full w-full">
                    <Image
                      fill
                      src={snippet.user.picture}
                      alt="profile picture"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <AvatarFallback className="bg-primary">
                    <span className="sr-only">{snippet.user.name}</span>
                    <span className="text-white">
                      {snippet.user.name
                        ? snippet.user.name.split("")[0].toUpperCase()
                        : null}
                    </span>
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <h1 className="font-bold text-zinc-800 text-xl sm:text-4xl">
              {snippet.name}
            </h1>
            <h3 className="text-muted-foreground text-lg sm:text-2xl">
              {/* @ts-ignore */}
              {LANGUAGES[snippet.language]}
            </h3>

            <div className="flex items-center gap-6 text-sm sm:text-lg text-muted-foreground">
              <div className="flex items-center gap-2">
                {isSaved ? (
                  <Heart
                    className="h-6 w-6 hover:cursor-pointer text-red-500"
                    onClick={() => saveSnippet({ snippetId: snippet.id })}
                    fill="red"
                  />
                ) : (
                  <Heart
                    className="h-6 w-6 hover:cursor-pointer hover:text-red-500"
                    onClick={() => saveSnippet({ snippetId: snippet.id })}
                  />
                )}
                {/* TODO: change from mocked to real count */}
                {formatSaveCount(saveCount)}
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <PlusCircleIcon className="h-6 w-6" />

                {format(new Date(snippet.createdAt), "MMM dd, yyyy")}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(snippet.code);
                toast("Code successfully saved to clipboard!")
              }}
            >
              Copy Code
            </Button>
          </div>
        </div>
      </div>
    );
  }
};

const SnippetPlaceholder = () => {
  return (
    <div className="max-w-6xl w-full mx-auto gap-6 pb-24 sm:pb-32 lg:gap-x-8 lg:px-8 lg:py-20">
      <div className="w-full flex items-start flex-col-reverse lg:flex-row gap-x-6 gap-y-4 mt-12 px-4">
        {/* code section */}
        <Skeleton className="h-80 w-2/3 bg-zinc-300" />

        <div className="flex flex-col gap-y-4 w-1/3">
          {/* creator name */}
          <Skeleton className="h-8 w-3/4 bg-zinc-300" />
          {/* snippet name */}
          <Skeleton className="h-12 w-full bg-zinc-300" />
          {/* snippet language */}
          <Skeleton className="h-10 w-1/2 bg-zinc-300" />

          <div className="flex items-center gap-6">
            {/* snippet saved count and date */}
            <Skeleton className="h-8 w-1/2 bg-zinc-300" />
            <Skeleton className="h-8 w-1/2 bg-zinc-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetDetails;
