"use client";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT, LANGUAGES, TSnippet } from "@/constants";
import { useIntersection } from "@mantine/hooks";
import { Ghost, ListFilter } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import MaxWidthWrapper from "./MaxWidthWrapper";
import SnippetListing from "./SnippetListing";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const SnippetsFeed = () => {
  const [languageFilter, setLanguageFilter] = useState("all");

  const [snippets, setSnippets] = useState<TSnippet[]>([]);
  const { data, isLoading, fetchNextPage, refetch } =
    trpc.getInfiniteSnippetFeed.useInfiniteQuery(
      {
        limit: INFINITE_QUERY_LIMIT,
        language: languageFilter === "all" ? null : languageFilter,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      }
    );

  useEffect(() => {
    if (data) {
      const allSnippets = data.pages.flatMap((page) => page.snippets) ?? [];
      setSnippets(allSnippets);
    }
  }, [data]);

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

  useEffect(() => {
    refetch();
  }, [languageFilter, refetch]);

  return (
    <MaxWidthWrapper className="max-w-7xl md:p-10">
      <div className="mt-8 flex items-start justify-between gap-4 border-b border-primary pb-5 flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-semibold text-3xl md:text-5xl text-foreground">
          Feed
        </h1>
        {/* TODO: search bar */}

        {/* filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="w-fit sm:w-32">
            <Button variant="outline" size="sm" className="h-9 gap-1">
              <ListFilter className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Filter
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full" align="start">
            <DropdownMenuLabel>Filter by language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={languageFilter}
              onValueChange={setLanguageFilter}
            >
              <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
              {Object.entries(LANGUAGES).map(([key, value]) => (
                <DropdownMenuRadioItem value={key} key={key}>
                  {value}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {snippets && snippets?.length > 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3  dark:border-zinc-800">
          {snippets.map((snippet, i) => {
            if (i === snippets.length - 1) {
              return (
                <SnippetListing
                  key={snippet.id}
                  creator={snippet.user}
                  snippet={snippet}
                  ref={ref}
                />
              );
            } else {
              return (
                <SnippetListing
                  key={snippet.id}
                  creator={snippet.user}
                  snippet={snippet}
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
          <Ghost className="h-8 w-8 text-zinc-800 dark:text-zinc-200" />
          <h3 className="font-semibold text-xl">Pretty empty around here</h3>
          <p>No snippets have been created yet by other users.</p>
        </div>
      )}
    </MaxWidthWrapper>
  );
};

export default SnippetsFeed;
