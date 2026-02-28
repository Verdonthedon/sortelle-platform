"use client";

import type { ToolCallResult } from "@/types/agents";
import { Badge } from "@/components/ui/badge";
import { Wrench, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface ToolCallDisplayProps {
  toolCall: ToolCallResult;
}

export function ToolCallDisplay({ toolCall }: ToolCallDisplayProps) {
  const statusIcon = {
    pending: <Loader2 className="h-3 w-3 animate-spin" />,
    running: <Loader2 className="h-3 w-3 animate-spin" />,
    completed: <CheckCircle className="h-3 w-3 text-green-500" />,
    error: <AlertCircle className="h-3 w-3 text-red-500" />,
  };

  return (
    <div className="my-2 rounded-lg border bg-muted/50 p-3 text-sm">
      <div className="flex items-center gap-2">
        <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">{toolCall.name.replace(/_/g, " ")}</span>
        {statusIcon[toolCall.status]}
        <Badge variant="outline" className="ml-auto text-xs">
          {toolCall.status}
        </Badge>
      </div>
      {toolCall.status === "completed" && toolCall.output && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-muted-foreground">
            View result
          </summary>
          <pre className="mt-1 overflow-x-auto rounded bg-background p-2 text-xs">
            {toolCall.output}
          </pre>
        </details>
      )}
    </div>
  );
}
