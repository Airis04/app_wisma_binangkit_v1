"use client";

import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

  return (
    <Card className="border-gray-200 p-4">
      <CustomToolbar
        date={currentDate}
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
          onSelectEvent={handleSelectEvent}
          popup={false}
          style={{ height: 620 }}
        />
      </div>

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
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-mono text-gray-500">
                    {activeEvent.id_reservasi}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {activeEvent.nama_tamu}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activeEvent.no_telepon}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20 shrink-0"
                >
                  {activeEvent.status_pesanan}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Unit</p>
                  <p className="font-medium text-gray-900">
                    {activeEvent.nama_unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-medium text-[#1E3A8A]">
                    {formatRupiah(activeEvent.total_tagihan)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Check-in</p>
                  <p className="font-medium text-gray-900">
                    {format(activeEvent.tgl_checkin, "d MMM yyyy", {
                      locale: idLocale,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Check-out</p>
                  <p className="font-medium text-gray-900">
                    {format(activeEvent.tgl_checkout, "d MMM yyyy", {
                      locale: idLocale,
                    })}
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
}: {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}) {
  const label = format(date, "MMMM yyyy", { locale: idLocale });

  return (
    <div className="flex items-center justify-between mb-4 px-1">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onNavigate("PREV")}
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft size={16} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onNavigate("TODAY")}
        >
          Hari Ini
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onNavigate("NEXT")}
          aria-label="Bulan berikutnya"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 capitalize">
        {label}
      </h2>
      <div className="w-[160px]" />
    </div>
  );
}

// Suppress unused warning for View type when locked to month
export type { View };
