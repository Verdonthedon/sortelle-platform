import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Megaphone, Search, Code, DollarSign } from "lucide-react";

const agents = [
  {
    href: "/dashboard/marketing",
    icon: Megaphone,
    name: "Marketing Agent",
    description:
      "Generate images, videos, ad copy, scripts, and social media posts with AI.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    href: "/dashboard/research",
    icon: Search,
    name: "Research Agent",
    description:
      "Search the web, analyze sources, and generate comprehensive reports.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    href: "/dashboard/coding",
    icon: Code,
    name: "Coding Agent",
    description:
      "Generate, review, and explain code in any programming language.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    href: "/dashboard/payroll",
    icon: DollarSign,
    name: "Payroll Agent",
    description:
      "Calculate pay, track hours, generate paystubs, and check compliance.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-1 text-muted-foreground">
          Choose an agent to get started.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {agents.map((agent) => (
          <Link key={agent.href} href={agent.href}>
            <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
              <CardHeader>
                <div
                  className={`mb-2 flex h-12 w-12 items-center justify-center rounded-lg ${agent.bg}`}
                >
                  <agent.icon className={`h-6 w-6 ${agent.color}`} />
                </div>
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                <CardDescription>{agent.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
