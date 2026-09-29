import * as React from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAdListQuery } from "../../Composable/Query/content/useAdListQuery";
import { useAdvertisersQuery } from "../../Composable/Query/dailyAdStats/useDailyAdStatsQuery";
import type { AdResponse } from "../../dto/response/content/adResponse";
import { CALENDAR_STATUSES, DEFAULT_CALENDAR_STATUSES, STATUS_COLORS, toCalendarEvents } from "./calendar_events";
import "./calendar.css";

export function CalendarComponent() {
    const navigate = useNavigate();
    const [statuses, setStatuses] = React.useState<string[]>(DEFAULT_CALENDAR_STATUSES);
    // Same pair as Daily Ad Performance: a standalone advertiser or an agency, then optionally one agency client.
    const [advertiserId, setAdvertiserId] = React.useState<string | undefined>();
    const [clientId, setClientId] = React.useState<string | undefined>();

    const { advertisers } = useAdvertisersQuery();
    const accountOptions = advertisers.filter((a) => a.type === "agency" || !a.agencyId);
    const selectedAccount = advertisers.find((a) => a.id === advertiserId);
    const isAgencySelected = selectedAccount?.type === "agency";
    const agencyClients = isAgencySelected ? advertisers.filter((a) => a.agencyId === advertiserId) : [];

    const { adListData, isLoading } = useAdListQuery(clientId ?? advertiserId);
    const events = React.useMemo(
        () => toCalendarEvents((adListData ?? []) as AdResponse[], statuses, true),
        [adListData, statuses],
    );

    const toggleStatus = (status: string, checked: boolean) =>
        setStatuses((current) => checked ? [...current, status] : current.filter((s) => s !== status));

    return (
        <div className="w-full mx-auto">
            <div className="flex flex-col gap-4 py-4">
                {/* Filter Section */}
                <div className="rounded-xl border-2 p-5 bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-base font-semibold">Search Filters</h3>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                {isAgencySelected ? 3 : 2} filters
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <label className="absolute -top-2 left-3 px-1 bg-card text-xs font-medium text-muted-foreground z-10">
                                Advertiser
                            </label>
                            <Select
                                value={advertiserId ?? "all"}
                                onValueChange={(value) => {
                                    setAdvertiserId(value === "all" ? undefined : value);
                                    setClientId(undefined);
                                }}
                            >
                                <SelectTrigger className="w-full border-2 rounded-lg">
                                    <SelectValue placeholder="All Advertisers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Advertisers</SelectItem>
                                    {accountOptions.map((adv) => (
                                        <SelectItem key={adv.id} value={adv.id}>
                                            {adv.type === "agency" ? `${adv.name} (Agency)` : adv.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {isAgencySelected && (
                            <div className="relative">
                                <label className="absolute -top-2 left-3 px-1 bg-card text-xs font-medium text-muted-foreground z-10">
                                    Client
                                </label>
                                <Select
                                    key={advertiserId}
                                    value={clientId ?? ""}
                                    onValueChange={(value) => setClientId(value === "all" ? undefined : value)}
                                >
                                    <SelectTrigger className="w-full border-2 rounded-lg">
                                        <SelectValue placeholder="All clients" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All clients</SelectItem>
                                        {agencyClients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="lg:col-span-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                            {CALENDAR_STATUSES.map((status) => (
                                <label key={status} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
                                    <Checkbox
                                        checked={statuses.includes(status)}
                                        onCheckedChange={(value) => toggleStatus(status, !!value)}
                                    />
                                    <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS[status] }} />
                                    {status}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Card className="rounded-2xl shadow-sm">
                <CardContent className="campaign-calendar p-4">
                    {isLoading ? (
                        <p className="text-center text-muted-foreground py-10">Loading.....</p>
                    ) : (
                        <FullCalendar
                            plugins={[dayGridPlugin, listPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,listMonth" }}
                            buttonText={{ today: "Today", dayGridMonth: "Month", listMonth: "List" }}
                            events={events}
                            dayMaxEvents={3}
                            height="auto"
                            noEventsContent="No ads in this month."
                            eventClick={(info) => {
                                info.jsEvent.preventDefault();
                                navigate(`/ads/${info.event.id}`);
                            }}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
