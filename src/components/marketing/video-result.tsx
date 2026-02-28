"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Clock } from "lucide-react";

interface VideoResultProps {
  url?: string;
  prompt: string;
  status: "queued" | "processing" | "completed" | "failed";
}

export function VideoResult({ url, prompt, status }: VideoResultProps) {
  if (status !== "completed" || !url) {
    return (
      <div className="my-3 rounded-xl border p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Video Generation</span>
          <Badge variant={status === "failed" ? "destructive" : "secondary"}>
            {status}
          </Badge>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{prompt}</p>
      </div>
    );
  }

  return (
    <div className="my-3 overflow-hidden rounded-xl border">
      <video
        src={url}
        controls
        className="max-w-md"
        preload="metadata"
      />
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
