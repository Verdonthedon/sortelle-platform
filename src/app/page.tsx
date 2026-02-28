import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, ArrowRight, Megaphone, Search, Code, DollarSign } from "lucide-react";

const agents = [
  {
    icon: Megaphone,
    name: "Marketing",
    description: "Generate images, videos, scripts, and social media content",
  },
  {
    icon: Search,
    name: "Research",
    description: "Search the web, analyze sources, and produce reports",
  },
  {
    icon: Code,
    name: "Coding",
    description: "Generate, review, and explain code in any language",
  },
  {
    icon: DollarSign,
    name: "Payroll",
    description: "Calculate pay, generate paystubs, and track compliance",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <span className="text-xl font-bold">Sortelle</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Your AI Team,
            <br />
            <span className="text-primary/70">Ready to Work</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Four specialized AI agents working together to handle your
            marketing, research, coding, and payroll. One platform, zero
            friction.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <agent.icon className="h-10 w-10 text-primary/70" />
                <h3 className="mt-4 text-lg font-semibold">{agent.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {agent.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Sortelle AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
