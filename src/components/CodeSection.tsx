"use client";

import Code from "./Code";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

const CodeSection = ({ code }: { code: string }) => {
  return (
    <ScrollArea className="relative">
      <Code code={code}></Code>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CodeSection;
