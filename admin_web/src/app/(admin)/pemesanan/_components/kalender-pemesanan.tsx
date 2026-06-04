"use client";

import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Home,
  Phone,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/format";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./kalender-pemesanan.css";

const locales = { id: idLocale };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: idLocale }),
  getDay,
  locales,
});

export type ReservasiEvent = {
  id_reservasi: string;
  id_unit: string;
  nama_unit: string;
  nama_tamu: string;
  no_telepon: string;
  tgl_checkin: Date;
  tgl_checkout: Date;
  total_tagihan: number;
  status_pesanan: string;
};

type CalendarEvent = ReservasiEvent & {
  title: string;
  start: Date;
  end: Date;
  allDay: true;
};

type Props = {
  events: ReservasiEvent[];
  selectedUnitIds: string[];
};

const messages = {
  date: "Tanggal",
  time: "Waktu",
  event: "Reservasi",
  allDay: "Sehari penuh",
  week: "Minggu",
  work_week: "Hari Kerja",
  day: "Hari",
  month: "Bulan",
  previous: "Sebelumnya",
  next: "Berikutnya",
  yesterday: "Kemarin",
  tomorrow: "Besok",
  today: "Hari ini",
  agenda: "Agenda",
  noEventsInRange: "Tidak ada reservasi pada periode ini.",
  showMore: (count: number) => `+${count} lagi`,
};

export default function KalenderPemesanan({ events, selectedUnitIds }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const filteredEvents = selectedUnitIds.length === 0
      ? []
      : events.filter((ev) => selectedUnitIds.includes(ev.id_unit));

    return filteredEvents.map((ev) => {
      const endInclusive = new Date(ev.tgl_checkout);
      endInclusive.setDate(endInclusive.getDate() - 1);

      return {
        ...ev,
        title: `${ev.nama_unit} — ${ev.nama_tamu}`,
        start: new Date(ev.tgl_checkin),
        end: endInclusive,
        allDay: true as const,
      };
    });
  }, [events, selectedUnitIds]);

  function handleSelectEvent(event: CalendarEvent, e: React.SyntheticEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopoverAnchor({ x: rect.left, y: rect.bottom });
    setActiveEvent(event);
  }

  function eventPropGetter() {
    return {
      className: "wb-event-terisi",
      style: {
        backgroundColor: "#EF4444",
        borderColor: "#DC2626",
        color: "#FFFFFF",
        borderRadius: "4px",
        padding: "2px 6px",
        fontSize: "12px",
        fontWeight: 500,
      },
    };
  }

  function dayPropGetter(date: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cell = new Date(date);
    cell.setHours(0, 0, 0, 0);
    if (cell < today) {
      return { className: "wb-day-past" };
    }
    return {};
  }

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <CalendarDays size={18} className="text-[#1E3A8A]" />
              Kalender Bulanan
            </CardTitle>
            <CardDescription>
              Klik pita merah untuk melihat detail tamu dan periode menginap.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]"
          >
            {calendarEvents.length} reservasi tampil
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-1">
        <CustomToolbar
          date={currentDate}
          onChange={(d) => setCurrentDate(d)}
          onNavigate={(action) => {
            const next = new Date(currentDate);
            if (action === "PREV") {
              next.setMonth(next.getMonth() - 1);
            } else if (action === "NEXT") {
              next.setMonth(next.getMonth() + 1);
            } else {
              next.setTime(new Date().getTime());
            }
            setCurrentDate(next);
          }}
        />

        <div className="wb-calendar-wrap">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            views={["month"]}
            view="month"
            onView={() => {}}
            date={currentDate}
            onNavigate={(d) => setCurrentDate(d)}
            toolbar={false}
            messages={messages}
            culture="id"
            eventPropGetter={eventPropGetter}
            dayPropGetter={dayPropGetter}
            onSelectEvent={handleSelectEvent}
            popup={false}
            style={{ height: 620 }}
          />
        </div>
      </CardContent>

      <Popover
        open={activeEvent !== null}
        onOpenChange={(open) => {
          if (!open) {
            setActiveEvent(null);
            setPopoverAnchor(null);
          }
        }}
      >
        <PopoverTrigger asChild>
          <span
            style={{
              position: "fixed",
              left: popoverAnchor?.x ?? 0,
              top: popoverAnchor?.y ?? 0,
              width: 1,
              height: 1,
              pointerEvents: "none",
            }}
            aria-hidden
          />
        </PopoverTrigger>
        {activeEvent && (
          <PopoverContent
            className="w-[344px] border-gray-200 p-0"
            align="start"
          >
            <div className="space-y-3">
              <div className="rounded-t-lg bg-[#1E3A8A] p-4 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-white/70">
                      {activeEvent.id_reservasi}
                    </p>
                    <p className="mt-1 text-base font-semibold">
                      {activeEvent.nama_tamu}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 border-white/30 bg-white/10 text-white"
                  >
                    {activeEvent.status_pesanan}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 pt-1 text-sm">
                <div className="rounded-lg border border-gray-200 bg-[#F9FAFB] p-3">
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Home size={13} />
                    Unit
                  </p>
                  <p className="mt-1 font-medium text-gray-900">
                    {activeEvent.nama_unit}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-[#F9FAFB] p-3">
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <CreditCard size={13} />
                    Total
                  </p>
                  <p className="mt-1 font-medium text-[#1E3A8A]">
                    {formatRupiah(activeEvent.total_tagihan)}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-[#F9FAFB] p-3">
                  <p className="text-xs text-gray-500">Check-in</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {format(activeEvent.tgl_checkin, "d MMM yyyy", {
                      locale: idLocale,
                    })}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-[#F9FAFB] p-3">
                  <p className="text-xs text-gray-500">Check-out</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {format(activeEvent.tgl_checkout, "d MMM yyyy", {
                      locale: idLocale,
                    })}
                  </p>
                </div>
                <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-3">
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={13} />
                    Nomor Telepon
                  </p>
                  <p className="mt-1 font-medium text-gray-900">
                    {activeEvent.no_telepon || "-"}
                  </p>
                </div>
              </div>
            </div>
          </PopoverContent>
        )}
      </Popover>
    </Card>
  );
}

function CustomToolbar({
  date,
  onNavigate,
  onChange,
}: {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
  onChange: (next: Date) => void;
}) {
  const currentYear = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let y = currentYear - 3; y <= currentYear + 5; y++) {
    yearOptions.push(y);
  }

  const monthLabels = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-[#F9FAFB] p-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onNavigate("PREV")}
          aria-label="Bulan sebelumnya"
          className="bg-white"
        >
          <ChevronLeft size={16} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onNavigate("TODAY")}
          className="bg-white font-medium text-[#1E3A8A]"
        >
          Hari Ini
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onNavigate("NEXT")}
          aria-label="Bulan berikutnya"
          className="bg-white"
        >
          <ChevronRight size={16} />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={String(date.getMonth())}
          onValueChange={(v) => {
            const next = new Date(date);
            next.setDate(1);
            next.setMonth(Number(v));
            onChange(next);
          }}
        >
          <SelectTrigger className="w-[150px] bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthLabels.map((label, idx) => (
              <SelectItem key={label} value={String(idx)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(date.getFullYear())}
          onValueChange={(v) => {
            const next = new Date(date);
            next.setDate(1);
            next.setFullYear(Number(v));
            onChange(next);
          }}
        >
          <SelectTrigger className="w-[108px] bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Suppress unused warning for View type when locked to month
export type { View };
