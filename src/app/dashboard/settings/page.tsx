"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.imageUrl} />
                  <AvatarFallback>
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Agents</CardTitle>
            <CardDescription>
              AI agents available on your plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Marketing Agent", status: "active" },
              { name: "Research Agent", status: "active" },
              { name: "Coding Agent", status: "active" },
              { name: "Payroll Agent", status: "active" },
            ].map((agent) => (
              <div
                key={agent.name}
                className="flex items-center justify-between"
              >
                <span className="text-sm">{agent.name}</span>
                <Badge variant="default">Active</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              External service connections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Anthropic (Claude)", env: "ANTHROPIC_API_KEY" },
              { name: "Replicate (Image/Video)", env: "REPLICATE_API_TOKEN" },
              { name: "Brave Search", env: "BRAVE_SEARCH_API_KEY" },
              { name: "Supabase", env: "NEXT_PUBLIC_SUPABASE_URL" },
            ].map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between"
              >
                <span className="text-sm">{service.name}</span>
                <Badge variant="outline">Configured via env</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
