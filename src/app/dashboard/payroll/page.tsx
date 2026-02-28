"use client";

import { ChatContainer } from "@/components/chat/chat-container";
import { DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function PayrollPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-end border-b px-4 py-2">
        <Link href="/dashboard/payroll/employees">
          <Button variant="outline" size="sm" className="gap-1">
            <Users className="h-3.5 w-3.5" />
            Manage Employees
          </Button>
        </Link>
      </div>
      <div className="flex-1">
        <ChatContainer
          agentType="payroll"
          agentName="Payroll Agent"
          agentDescription="Calculate pay, track hours, generate paystubs, and check compliance"
          placeholder="e.g., Calculate biweekly pay for $4,000 gross..."
          icon={<DollarSign className="h-6 w-6 text-amber-500" />}
        />
      </div>
    </div>
  );
}
