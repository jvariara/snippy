import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  if (typeof window !== "undefined")
    // browser should use relative path
    return "";
  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function formatSaveCount(count?: number): string {
  if (typeof count === "undefined") {
    return "0";
  }

  if (count < 1000) {
    return count.toString(); // Return the count as is
  } else if (count < 1000000) {
    // Convert count to thousands (K)
    const formattedCount = (count / 1000).toFixed(1);
    return `${formattedCount}K`;
  } else {
    // Convert count to millions (M)
    const formattedCount = (count / 1000000).toFixed(1);
    return `${formattedCount}M`;
  }
}

export function constructMetadata({
  title = "Snippy - the code snippet application",
  description = "Snippy is application for uploading and sharing your frequently used code snippets.",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    icons,
    metadataBase: new URL("https://transcribot.vercel.app"),
    themeColor: "#FFF",
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}