"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DbEmployee } from "@/types/database";

interface EmployeeFormProps {
  employee?: DbEmployee | null;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}

export function EmployeeForm({
  employee,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const [name, setName] = useState(employee?.name || "");
  const [email, setEmail] = useState(employee?.email || "");
  const [position, setPosition] = useState(employee?.position || "");
  const [department, setDepartment] = useState(employee?.department || "");
  const [payType, setPayType] = useState<string>(employee?.pay_type || "hourly");
  const [hourlyRate, setHourlyRate] = useState(
    String(employee?.hourly_rate || "")
  );
  const [salary, setSalary] = useState(String(employee?.salary || ""));
  const [startDate, setStartDate] = useState(employee?.start_date || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...(employee ? { id: employee.id } : {}),
      name,
      email,
      position,
      department: department || undefined,
      pay_type: payType,
      hourly_rate: payType === "hourly" ? Number(hourlyRate) : 0,
      salary: payType === "salary" ? Number(salary) : undefined,
      start_date: startDate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
        <div>
          <Label>Pay Type</Label>
          <Select value={payType} onValueChange={setPayType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {payType === "hourly" ? (
          <div>
            <Label htmlFor="rate">Hourly Rate ($)</Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              required
            />
          </div>
        ) : (
          <div>
            <Label htmlFor="salary">Annual Salary ($)</Label>
            <Input
              id="salary"
              type="number"
              step="0.01"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {employee ? "Update" : "Add"} Employee
        </Button>
      </div>
    </form>
  );
}
