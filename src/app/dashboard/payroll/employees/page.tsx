"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmployeeTable } from "@/components/payroll/employee-table";
import { EmployeeForm } from "@/components/payroll/employee-form";
import type { DbEmployee } from "@/types/database";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<DbEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<DbEmployee | null>(
    null
  );

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/payroll/employees");
    if (res.ok) {
      const data = await res.json();
      setEmployees(data.employees);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const method = data.id ? "PUT" : "POST";
    await fetch("/api/payroll/employees", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setDialogOpen(false);
    setEditingEmployee(null);
    fetchEmployees();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/payroll/employees?id=${id}`, { method: "DELETE" });
    fetchEmployees();
  };

  const handleEdit = (emp: DbEmployee) => {
    setEditingEmployee(emp);
    setDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/payroll">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Employees</h1>
            <p className="text-sm text-muted-foreground">
              Manage your team members
            </p>
          </div>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingEmployee(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? "Edit" : "Add"} Employee
              </DialogTitle>
            </DialogHeader>
            <EmployeeForm
              employee={editingEmployee}
              onSubmit={handleSubmit}
              onCancel={() => {
                setDialogOpen(false);
                setEditingEmployee(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team ({employees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Loading...
            </p>
          ) : (
            <EmployeeTable
              employees={employees}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
