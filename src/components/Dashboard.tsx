"use client";
import { trpc } from "@/app/_trpc/client";
import { ArrowRight, Ghost, PlusCircle } from "lucide-react";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import MaxWidthWrapper from "./MaxWidthWrapper";
import SnippetListing from "./SnippetListing";
import { buttonVariants } from "./ui/button";
import { INFINITE_QUERY_LIMIT } from "@/constants";
import { useEffect, useRef, useState } from "react";
import { useIntersection } from "@mantine/hooks";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface DashboardProps {
  userId: string;
}

const Dashboard = ({ userId }: DashboardProps) => {
  const [isMySnippets, setIsMySnippets] = useState<boolean>(true);
  const { data, isLoading, fetchNextPage } =
    trpc.getUserSnippets.useInfiniteQuery(
      {
        id: userId,
        limit: INFINITE_QUERY_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      }
    );

  const snippets = data?.pages.flatMap((page) => page.snippets);
  const lastSnippetRef = useRef<HTMLLIElement>(null);
  const { ref, entry } = useIntersection({
    root: lastSnippetRef.current,
    threshold: 1,
  });
  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const onSelect = (snippetType: string) => {
    if (snippetType === "my-snippets") {
      setIsMySnippets(true);
    } else if (snippetType === "saved-snippets") {
      setIsMySnippets(false);
    }
  };

  const {
    data: savedSnippetData,
    isLoading: isSavedSnippetLoading,
    fetchNextPage: fetchNextSavedPage,
  } = trpc.getSavedSnippets.useInfiniteQuery(
    {
      limit: INFINITE_QUERY_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      refetchOnMount: true,
      refetchOnWindowFocus: true
    }
  );

  const savedSnippets = savedSnippetData?.pages.flatMap(
    (page) => page.snippets
  );

  const lastSavedSnippetRef = useRef<HTMLLIElement>(null);
  const { ref: savedRef, entry: savedEntry } = useIntersection({
    root: lastSavedSnippetRef.current,
    threshold: 1,
  });
  useEffect(() => {
    if (savedEntry?.isIntersecting) {
      fetchNextSavedPage();
    }
  }, [savedEntry, fetchNextSavedPage]);

  return (
    <MaxWidthWrapper className="max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <Select defaultValue="my-snippets" onValueChange={(e) => onSelect(e)}>
          <SelectTrigger className="w-fit text-3xl md:text-5xl py-8 pl-0 bg-inherit border-none">
            <SelectValue placeholder="Select viewing option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="my-snippets">My Snippets</SelectItem>
              <SelectItem value="saved-snippets">Saved Snippets</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {isMySnippets ? (
          <Link href="/create-snippet" className={buttonVariants()}>
            <PlusCircle className="h-5 w-5 mr-1.5" />
            Create
          </Link>
        ) : null}
      </div>

      {/* display snippets */}
      {isMySnippets ? (
        <>
          {snippets && snippets?.length > 0 ? (
            <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 divide-y divide-zinc-200">
              {snippets.map((snippet, i) => {
                if (i === snippets.length - 1) {
                  return (
                    <SnippetListing
                      key={snippet.id}
                      snippet={snippet}
                      creator={snippet.user}
                      ref={ref}
                      origin="dashboard"
                    />
                  );
                } else {
                  return (
                    <SnippetListing
                      key={snippet.id}
                      snippet={snippet}
                      creator={snippet.user}
                      origin="dashboard"
                    />
                  );
                }
              })}
            </ul>
          ) : isLoading ? (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton height={100} className="my-2 col-span-1" count={1} />
              <Skeleton height={100} className="my-2 col-span-1" count={1} />
              <Skeleton height={100} className="my-2 col-span-1" count={1} />
            </div>
          ) : (
            <div className="mt-16 flex flex-col items-center gap-2">
              <Ghost className="h-8 w-8 text-zinc-800" />
              <h3 className="font-semibold text-xl">
                Pretty empty around here
              </h3>
              <p>Let&apos;s create your first snippet.</p>
              <Link href="/create-snippet" className={buttonVariants()}>
                Create Snippet <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </div>
          )}
        </>
      ) : (
        <>
          {savedSnippets && savedSnippets?.length > 0 ? (
            <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 divide-y divide-zinc-200">
              {savedSnippets.map((snippet, i) => {
                if (i === savedSnippets.length - 1) {
                  return (
                    <SnippetListing
                      key={snippet.id}
                      snippet={snippet.snippet}
                      creator={snippet.snippet.user}
                      ref={savedRef}
                    />
                  );
                } else {
                  return (
                    <SnippetListing
                      key={snippet.id}
                      snippet={snippet.snippet}
                      creator={snippet.snippet.user}
                    />
                  );
                }
              })}
            </ul>
          ) : isSavedSnippetLoading ? (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton height={100} className="my-2 col-span-1" count={1} />
              <Skeleton height={100} className="my-2 col-span-1" count={1} />
              <Skeleton height={100} className="my-2 col-span-1" count={1} />
            </div>
          ) : (
            <div className="mt-16 flex flex-col items-center gap-2">
              <Ghost className="h-8 w-8 text-zinc-800" />
              <h3 className="font-semibold text-xl">
                Pretty empty around here
              </h3>
              <p>Let&apos;s save your first snippet.</p>
              <Link href="/snippets" className={buttonVariants()}>
                Find snippets to save <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </div>
          )}
        </>
      )}
    </MaxWidthWrapper>
  );
};

export default Dashboard;
