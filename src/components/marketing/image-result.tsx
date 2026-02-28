"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

interface ImageResultProps {
  url: string;
  prompt: string;
}

export function ImageResult({ url, prompt }: ImageResultProps) {
  return (
    <div className="my-3 overflow-hidden rounded-xl border">
      <div className="relative aspect-square max-w-md">
        <Image
          src={url}
          alt={prompt}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex items-center justify-between border-t p-3">
        <p className="text-xs text-muted-foreground line-clamp-1">{prompt}</p>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href={url} download>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
