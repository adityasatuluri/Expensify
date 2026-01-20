"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CURRENCY_SYMBOL } from "@/lib/types";
import type { Transaction } from "@/lib/types";

interface AnalyticsProps {
  transactions: Transaction[];
}

type TimeRange = "monthly" | "yearly" | "all";

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

export default function Analytics({ transactions }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");

  const stats = useMemo(() => {
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const subscriptions = transactions
      .filter((t) => t.type === "subscription")
      .reduce((sum, t) => sum + t.amount, 0);

    const net = income - expenses - subscriptions;

    return { expenses, income, subscriptions, net };
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const categories: { [key: string]: number } = {};

    transactions
      .filter((t) => t.type === "expense" || t.type === "subscription")
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const data: {
      month: string;
      income: number;
      expense: number;
      subscription: number;
      timestamp: number;
    }[] = [];
    const months: {
      [key: string]: {
        income: number;
        expense: number;
        subscription: number;
        timestamp: number;
      };
    } = {};

    let startDate = new Date();
    if (timeRange === "monthly") {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeRange === "yearly") {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      // All time
      const allDates = transactions.map((t) => new Date(t.date));
      if (allDates.length > 0) {
        startDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
      }
    }

    transactions
      .filter((t) => new Date(t.date) >= startDate)
      .forEach((t) => {
        const date = new Date(t.date);
        const key =
          timeRange === "yearly"
            ? date.toLocaleString("default", {
                month: "short",
                year: "2-digit",
              })
            : date.toLocaleString("default", {
                month: "short",
                day: "numeric",
              });

        if (!months[key]) {
          months[key] = {
            income: 0,
            expense: 0,
            subscription: 0,
            timestamp: date.getTime(),
          };
        }

        if (t.type === "income") {
          months[key].income += t.amount;
        } else if (t.type === "expense") {
          months[key].expense += t.amount;
        } else {
          months[key].subscription += t.amount;
        }
      });

    Object.entries(months)
      .map(([month, values]) => ({ month, ...values }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach((item) => {
        const { timestamp, ...rest } = item;
        data.push(rest);
      });

    return data;
  }, [transactions, timeRange]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Income</p>
          <p className="text-2xl font-bold text-green-600">
            {CURRENCY_SYMBOL}
            {stats.income.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            {CURRENCY_SYMBOL}
            {stats.expenses.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Subscriptions</p>
          <p className="text-2xl font-bold text-blue-600">
            {CURRENCY_SYMBOL}
            {stats.subscriptions.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Net</p>
          <p
            className={`text-2xl font-bold ${stats.net >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {CURRENCY_SYMBOL}
            {stats.net.toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        <Button
          variant={timeRange === "monthly" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange("monthly")}
        >
          Monthly
        </Button>
        <Button
          variant={timeRange === "yearly" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange("yearly")}
        >
          Yearly
        </Button>
        <Button
          variant={timeRange === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange("all")}
        >
          All Time
        </Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${CURRENCY_SYMBOL}${value}`} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" />
              <Line type="monotone" dataKey="subscription" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Category Breakdown</h3>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: ${CURRENCY_SYMBOL}${value.toFixed(0)}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryBreakdown.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${CURRENCY_SYMBOL}${value}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No expense data available
            </div>
          )}
        </Card>

        {/* Monthly Bar Chart */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Monthly Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${CURRENCY_SYMBOL}${value}`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" />
              <Bar dataKey="expense" fill="#ef4444" />
              <Bar dataKey="subscription" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Category Details */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Category Details</h3>
        <div className="space-y-2">
          {categoryBreakdown.map((category) => (
            <div
              key={category.name}
              className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
            >
              <span className="font-medium">{category.name}</span>
              <span className="text-sm font-semibold">
                {CURRENCY_SYMBOL}
                {category.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
