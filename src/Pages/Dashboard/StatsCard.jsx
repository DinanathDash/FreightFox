import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../Components/ui/chart";
import { Bar, BarChart, Line, LineChart, Area, ResponsiveContainer, XAxis, YAxis } from "recharts";

function StatsCard({ title, value, change, icon, color = "blue", chartData, type = "line" }) {
  // Add default empty chart data if none provided
  const data = chartData && chartData.length > 0 
    ? chartData 
    : Array(7).fill().map((_, i) => ({ name: `Day ${i+1}`, value: Math.floor(Math.random() * 10) }));
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <div className={`w-5 h-5 text-${color}-500 mr-2`}>
            {icon}
          </div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <circle cx="19" cy="12" r="2" fill="currentColor" />
            <circle cx="5" cy="12" r="2" fill="currentColor" />
          </svg>
        </button>
      </CardHeader>
      <CardContent className="">
        <div className="grid grid-cols-2">
          <div>
            <div className="text-3xl font-bold">{value}</div>
            <div className="flex items-center mt-2">
              <span className="text-xs text-gray-500">VS Last Week</span>
              <span className={`ml-2 px-1.5 py-0.5 text-xs ${change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
            </div>
          </div>
          
          {/* Chart */}
          <div className="h-[60px] md:h-[90px] w-full">
            <ChartContainer
              config={{
                value: {
                  theme: {
                    light: color === "blue" ? "#3b82f6" : color === "green" ? "#10b981" : "#6366f1",
                    dark: color === "blue" ? "#60a5fa" : color === "green" ? "#34d399" : "#818cf8",
                  },
                },
              }}
            >
              {type === "line" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 30 }}>
                    <defs>
                      <linearGradient id={`colorValue-${title}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Line
                      type="monotone"
                      dataKey="value"
                      strokeWidth={2}
                      dot
                      style={{ stroke: "var(--color-value)" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="none"
                      fill={`url(#colorValue-${title})`}
                    />
                    <XAxis dataKey="name" hide={true} />
                    <YAxis hide={true} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent 
                          indicator="dot" 
                          formatter={(value) => (
                            <span className="text-foreground">{value}</span>
                          )}
                        />
                      }
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 30 }}>
                    <defs>
                      <linearGradient id={`colorBar-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={false}
                      height={0}
                    />
                    <YAxis hide={true} domain={[0, 'dataMax + 2']} />
                    <Bar
                      dataKey="value"
                      radius={[4, 4, 0, 0]}
                      fill={`url(#colorBar-${title.replace(/\s+/g, '')})`}
                      minPointSize={5}
                      maxBarSize={26}
                    />
                    <ChartTooltip
                      cursor={{ fill: "rgba(243, 244, 246, 0.3)" }}
                      content={
                        <ChartTooltipContent 
                          indicator="dot" 
                          formatter={(value) => (
                            <span className="text-foreground">{value}</span>
                          )}
                        />
                      }
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatsCard;
