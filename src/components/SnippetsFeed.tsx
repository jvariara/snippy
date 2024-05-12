"use client";
import { trpc } from "@/app/_trpc/client";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { INFINITE_QUERY_LIMIT } from "@/constants";
import SnippetListing from "./SnippetListing";
import { useIntersection } from "@mantine/hooks";
import { useEffect, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import { Ghost } from "lucide-react";

const SnippetsFeed = () => {
  const { data, isLoading, fetchNextPage } =
    trpc.getInfiniteSnippetFeed.useInfiniteQuery(
      {
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

  return (
    <MaxWidthWrapper className="max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-3xl md:text-5xl text-gray-900">
          Feed
        </h1>
        {/* TODO: search bar */}
      </div>

      {snippets && snippets?.length > 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 divide-y divide-zinc-200">
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
          <Ghost className="h-8 w-8 text-zinc-800" />
          <h3 className="font-semibold text-xl">Pretty empty around here</h3>
          <p>No snippets have been created yet by other users.</p>
        </div>
      )}
    </MaxWidthWrapper>
  );
};

export default SnippetsFeed;
