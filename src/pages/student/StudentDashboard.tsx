"use client";

import { useEvents } from "@/hooks/useEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Calendar, Users, MapPin, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Department } from "@/types";

const departmentColors: Record<Department, string> = {
  CCS: "bg-orange-500",
  CEAS: "bg-blue-500",
  CAHS: "bg-red-500",
  CHTM: "bg-pink-500",
  CBA: "bg-yellow-500",
};

const CARD_BG = "bg-white";
const CARD_BORDER = "border-zinc-200";
const DARK_TEXT = "text-zinc-900";
const SECONDARY_TEXT = "text-zinc-600";

export default function StudentDashboard() {
  const { events, loading } = useEvents();

  const upcomingEvents = events.filter((event) => event.startDate > new Date()).slice(0, 5);
  const totalEvents = events.length;
  const upcomingCount = events.filter((event) => event.startDate > new Date()).length;

  const departmentStats = events.reduce(
    (acc, event) => {
      acc[event.department] = (acc[event.department] || 0) + 1;
      return acc;
    },
    {} as Record<Department, number>
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 bg-white min-h-screen text-zinc-900">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Student Dashboard</h1>
        <p className="text-zinc-600">Overview of upcoming events and activities</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className={`${CARD_BORDER} ${CARD_BG} shadow-md`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${SECONDARY_TEXT}`}>Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900">{totalEvents}</div>
            <p className="text-xs text-zinc-500">All posted events</p>
          </CardContent>
        </Card>

        <Card className={`${CARD_BORDER} ${CARD_BG} shadow-md`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${SECONDARY_TEXT}`}>Upcoming Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900">{upcomingCount}</div>
            <p className="text-xs text-zinc-500">Scheduled in the future</p>
          </CardContent>
        </Card>

        <Card className={`${CARD_BORDER} ${CARD_BG} shadow-md`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${SECONDARY_TEXT}`}>Departments</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900">{Object.keys(departmentStats).length}</div>
            <p className="text-xs text-zinc-500">Active departments</p>
          </CardContent>
        </Card>

        <Card className={`${CARD_BORDER} ${CARD_BG} shadow-md`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${SECONDARY_TEXT}`}>Locations</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900">
              {new Set(events.map((e) => e.location)).size}
            </div>
            <p className="text-xs text-zinc-500">Unique venues</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Distribution */}
      <Card className={`${CARD_BORDER} ${CARD_BG} shadow-md`}>
        <CardHeader>
          <CardTitle className={DARK_TEXT}>Department Event Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(departmentStats).map(([dept, count]) => (
              <div key={dept} className="flex items-center gap-4">
                <div className={`h-3 w-3 rounded-full ${departmentColors[dept as Department]}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${DARK_TEXT}`}>{dept}</span>
                    <span className={`text-sm ${SECONDARY_TEXT}`}>{count} events</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-300">
                    <div
                      className={`h-full ${departmentColors[dept as Department]}`}
                      style={{ width: `${(count / totalEvents) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className={`${CARD_BORDER} ${CARD_BG} shadow-md`}>
        <CardHeader>
          <CardTitle className={DARK_TEXT}>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <p className="text-center text-zinc-500">No upcoming events</p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className={`flex items-start gap-4 rounded-lg border ${CARD_BORDER} p-4 bg-white shadow-sm`}
                >
                  <div
                    className={`mt-1 h-2 w-2 rounded-full ${
                      departmentColors[event.department]
                    }`}
                  />
                  <div className="flex-1">
                    <h3 className={`font-medium ${DARK_TEXT}`}>{event.eventName}</h3>
                    <p className={`text-sm ${SECONDARY_TEXT}`}>{event.location}</p>
                    <div className={`mt-2 flex items-center gap-4 text-xs ${SECONDARY_TEXT}`}>
                      <span>{formatDate(event.startDate)}</span>
                      <span>•</span>
                      <span>{event.department}</span>
                      {event.professor && (
                        <>
                          <span>•</span>
                          <span>{event.professor}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
