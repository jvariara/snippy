import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import SnippetReel from "@/components/SnippetReel";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <MaxWidthWrapper className="">
        <div className="py-20 mx-auto text-center flex flex-col items-center max-w-3xl">
          <div className="mx-auto mb-5 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-red-100/30">
            <p className="text-sm font-semibold text-primary">Snippy</p>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-gray-700 sm:text-6xl">
            Welcome to <span className="text-primary">Snippy</span> ✂
          </h1>
          <p className="text-lg max-w-prose font-medium text-muted-foreground mt-4">
            Your hub for easy-to-use code snippets. Just find the snippet you
            want and copy and paste it into your project!
          </p>

          {/* CTA */}
          <div className="mt-6">
            <Link href="/dashboard" className={buttonVariants()}>
              Dashboard <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </div>
        </div>

        {/* TODO: display snippets */}
        <SnippetReel
          title="Trending"
          href="/snippets"
          subtitle="Browse trending snippets"
        />
      </MaxWidthWrapper>
    </>
  );
}
