"use client";
import { trpc } from "@/app/_trpc/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import SnippetListing from "./SnippetListing";

interface SnippetReelProps {
  title: string;
  subtitle?: string;
  href?: string;
}

const FALLBACK_LIMIT = 4;

const SnippetReel = ({ title, subtitle, href }: SnippetReelProps) => {
  const { data: trendingSnippets, isLoading } =
    trpc.getTrendingSnippets.useQuery();

  return (
    <section className="py-12">
      <div className="md:flex md:items-center md:justify-between mb-4 border-b border-primary pb-4">
        <div className="max-w-2xl px-4 lg:max-w-4xl lg:px-0">
          {title ? (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-300 sm:text-3xl">
              {title}
            </h1>
          ) : null}
          {subtitle ? (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        {href ? (
          <Link
            href={href}
            className="hidden text-sm font-medium text-primary hover:text-primary/80 md:flex md:items-center"
          >
            Browse snippets <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        ) : null}
      </div>

      <div className="relative">
        <div className="mt-6 flex items-center w-full">
          {/* display each product */}
          {trendingSnippets && trendingSnippets?.length > 0 ? (
            <ul className="w-full grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-12 lg:gap-x-8">
              {trendingSnippets.map((snippet) => (
                <SnippetListing
                  key={snippet.id}
                  snippet={snippet}
                  creator={snippet.user}
                  origin="reel"
                />
              ))}
            </ul>
          ) : isLoading ? (
            <>
              <Skeleton height={100} className="my-2 col-span-1" count={1} />
              <Skeleton height={100} className="my-2 col-span-1" count={1} />
              <Skeleton height={100} className="my-2 col-span-1" count={1} />
              <Skeleton height={100} className="my-2 col-span-1" count={1} />
            </>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SnippetReel;
