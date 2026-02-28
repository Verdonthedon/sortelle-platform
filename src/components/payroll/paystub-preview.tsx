"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PaystubPreviewProps {
  employeeName: string;
  periodStart: string;
  periodEnd: string;
  grossPay: number;
  deductions: Record<string, number>;
  netPay: number;
  hoursWorked?: number | null;
}

export function PaystubPreview({
  employeeName,
  periodStart,
  periodEnd,
  grossPay,
  deductions,
  netPay,
  hoursWorked,
}: PaystubPreviewProps) {
  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <Card className="max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Paystub</CardTitle>
        <p className="text-sm text-muted-foreground">{employeeName}</p>
        <p className="text-xs text-muted-foreground">
          Period: {periodStart} to {periodEnd}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Gross Pay</span>
          <span className="font-medium">{fmt(grossPay)}</span>
        </div>
        {hoursWorked != null && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Hours Worked</span>
            <span>{hoursWorked}</span>
          </div>
        )}
        <Separator />
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Deductions
          </p>
          {Object.entries(deductions).map(([key, val]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <span className="text-destructive">-{fmt(val)}</span>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex justify-between text-base font-semibold">
          <span>Net Pay</span>
          <span className="text-green-600">{fmt(netPay)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
