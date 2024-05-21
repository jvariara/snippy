"use client";
import { trpc } from "@/app/_trpc/client";
import { LANGUAGES } from "@/constants";
import { formatSaveCount } from "@/lib/utils";
import { TVisibility } from "@/lib/validations/snippet";
import { format } from "date-fns";
import {
  Code,
  Heart,
  Loader2,
  Lock,
  LockOpen,
  PlusCircleIcon,
  Settings,
  Trash,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

interface SnippetProps {
  creator: {
    id: string;
    name: string | null;
    email: string;
    picture: string | null;
  };
  snippet: {
    userId: string | null;
    id: string;
    code: string;
    name: string;
    language: string;
    visibility: TVisibility;
    createdAt: string;
    updatedAt: string;
  };
  origin?: string;
}

const SnippetListing = forwardRef<HTMLLIElement, SnippetProps>(
  ({ creator, snippet, origin }, ref) => {
    const utils = trpc.useUtils();
    const router = useRouter();

    const { mutate: deleteSnippet, isPending } = trpc.deleteSnippet.useMutation(
      {
        onSuccess: () => {
          utils.getUserSnippets.invalidate();
        },
      }
    );

    const { data: snippetSaveCount } = trpc.getSnippetSaveCount.useQuery({
      snippetId: snippet.id,
    });

    const { data: isSnippetSaved } = trpc.isSnippetSaved.useQuery({
      snippetId: snippet.id,
    });

    const { mutate: saveSnippet } = trpc.saveSnippet.useMutation({
      onSuccess: () => {
        utils.getSnippetSaveCount.invalidate();
        utils.isSnippetSaved.invalidate();
      },
    });

    return (
      <li
        ref={ref}
        className="relative col-span-1 divide-y divide-primary w-full rounded-lg bg-white dark:bg-black transition shadow-lg border border-primary"
      >
        {origin === "dashboard" ? (
          <Settings
            className="absolute top-3 right-3 h-5 w-5 text-muted-foreground hover:cursor-pointer"
            onClick={() => router.push(`/edit-snippet/${snippet.id}`)}
          />
        ) : null}
        <Link href={`/snippets/${snippet.id}`}>
          <div className="flex flex-col justify-center w-full items-center md:flex-row md:justify-between gap-y-2 md:space-x-6 p-4 sm:p-6">
            <Avatar className="relative w-10 h-10">
              {creator.picture ? (
                <div className="relative aspect-square h-full w-full">
                  <Image
                    fill
                    src={creator.picture}
                    alt="profile picture"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <AvatarFallback className="bg-primary">
                  <span className="sr-only">{creator.name}</span>
                  <span className="text-white">
                    {creator.name
                      ? creator.name.split("")[0].toUpperCase()
                      : null}
                  </span>
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 truncate">
              <div className="flex flex-col items-center sm:items-start justify-start ">
                <h3 className="text-md md:text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  {snippet.name}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Code className="h-4 w-4" />
                  {/* @ts-ignore */}
                  {LANGUAGES[snippet.language]}
                </div>
              </div>
            </div>
          </div>
        </Link>

        <div className="px-6 flex items-center justify-center md:justify-start py-4 gap-6 text-xs sm:text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            {isSnippetSaved ? (
              <Heart
                className="h-4 w-4 text-red-600 cursor-pointer"
                fill="red"
                onClick={() => saveSnippet({ snippetId: snippet.id })}
              />
            ) : (
              <Heart
                className="h-4 w-4 cursor-pointer"
                onClick={() => saveSnippet({ snippetId: snippet.id })}
              />
            )}
            {formatSaveCount(snippetSaveCount)}
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap w-fit">
            <PlusCircleIcon className="h-4 w-4" />
            {format(new Date(snippet.createdAt), "MMM dd, yyyy")}
          </div>

          {origin === "dashboard" ? (
            <>
              {snippet.visibility === "private" ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <LockOpen className="h-4 w-4 text-muted-foreground" />
              )}
            </>
          ) : null}

          {origin === "dashboard" ? (
            <Button
              size="sm"
              variant="destructive"
              className="w-fit"
              onClick={() => deleteSnippet({ id: snippet.id })}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
            </Button>
          ) : null}
        </div>
      </li>
    );
  }
);

SnippetListing.displayName = "SnippetListing";

export default SnippetListing;
