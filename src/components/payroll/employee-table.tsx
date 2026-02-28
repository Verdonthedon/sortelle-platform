"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { DbEmployee } from "@/types/database";

interface EmployeeTableProps {
  employees: DbEmployee[];
  onEdit: (employee: DbEmployee) => void;
  onDelete: (id: string) => void;
}

export function EmployeeTable({
  employees,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Pay Type</TableHead>
          <TableHead>Rate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[80px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
              No employees yet. Add one to get started.
            </TableCell>
          </TableRow>
        ) : (
          employees.map((emp) => (
            <TableRow key={emp.id}>
              <TableCell className="font-medium">{emp.name}</TableCell>
              <TableCell>{emp.position}</TableCell>
              <TableCell>{emp.department || "—"}</TableCell>
              <TableCell>
                <Badge variant="outline">{emp.pay_type}</Badge>
              </TableCell>
              <TableCell>
                {emp.pay_type === "hourly"
                  ? `$${emp.hourly_rate}/hr`
                  : `$${emp.salary?.toLocaleString()}/yr`}
              </TableCell>
              <TableCell>
                <Badge
                  variant={emp.status === "active" ? "default" : "secondary"}
                >
                  {emp.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(emp)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(emp.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
