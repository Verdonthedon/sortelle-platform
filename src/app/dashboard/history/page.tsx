"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Megaphone, Search, Code, DollarSign, MessageSquare } from "lucide-react";
import type { AgentType } from "@/types/agents";

interface SessionSummary {
  id: string;
  agent_type: AgentType;
  title: string | null;
  created_at: string;
  updated_at: string;
}

const agentIcons: Record<AgentType, typeof Code> = {
  marketing: Megaphone,
  research: Search,
  coding: Code,
  payroll: DollarSign,
};

const agentColors: Record<AgentType, string> = {
  marketing: "text-pink-500",
  research: "text-blue-500",
  coding: "text-green-500",
  payroll: "text-amber-500",
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = filter !== "all" ? `?agentType=${filter}` : "";
      const res = await fetch(`/api/sessions${params}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
      setLoading(false);
    }
    load();
  }, [filter]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Chat History</h1>
        <p className="text-sm text-muted-foreground">
          Browse your past conversations with agents
        </p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="coding">Coding</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-12">
              Loading...
            </p>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const Icon = agentIcons[session.agent_type];
                return (
                  <Card key={session.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted`}
                      >
                        <Icon
                          className={`h-5 w-5 ${agentColors[session.agent_type]}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {session.title || "Untitled conversation"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {session.agent_type}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
