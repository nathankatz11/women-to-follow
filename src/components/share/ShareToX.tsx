"use client";

import { composeTweetUrl } from "@/lib/x-api";
import { Button } from "@/components/ui/button";

interface ShareToXProps {
  handles: string[];
  className?: string;
}

export function ShareToX({ handles, className }: ShareToXProps) {
  const tweetUrl = composeTweetUrl(handles);

  return (
    <a
      href={tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <Button size="lg" className="gap-2 w-full">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </Button>
    </a>
  );
}
