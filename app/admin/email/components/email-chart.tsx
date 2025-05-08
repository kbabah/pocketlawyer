"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";

type ChartDataPoint = {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
};

export function RenderEmailChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="sent"
            stroke="#0ea5e9"
            strokeWidth={2}
            name="Sent"
          />
          <Line
            type="monotone"
            dataKey="opened"
            stroke="#22c55e"
            strokeWidth={2}
            name="Opened"
          />
          <Line
            type="monotone"
            dataKey="clicked"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Clicked"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}