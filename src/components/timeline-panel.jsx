import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { bridges } from "@/data/bridges"
import { formatMinutes, getScheduleEvents } from "@/lib/schedule"

const HOUR_MARKS = [0, 60, 120, 180, 240, 300, 360]

export function TimelinePanel({ minute, summary, onMinuteChange }) {
  const events = useMemo(() => getScheduleEvents(bridges), [])

  return (
    <div className="timeline-shell">
      <Card className="glass-panel timeline-card gap-0 border-white/10 py-0 text-slate-100 shadow-2xl shadow-black/40">
        <CardContent className="px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
                Время на карте
              </p>
              <time className="mt-0.5 block text-3xl font-semibold tabular-nums tracking-tight text-white">
                {formatMinutes(minute)}
              </time>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1.5">
                <Badge className="border border-teal-300/20 bg-teal-300/10 text-teal-200">
                  {summary.open} открыты
                </Badge>
                <Badge className="border border-rose-300/20 bg-rose-300/10 text-rose-200">
                  {summary.closed} закрыты
                </Badge>
              </div>
              <div className="hidden items-center gap-3 text-xs text-slate-300 sm:flex">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-teal-300" /> проезд открыт
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-rose-300" /> проезд закрыт
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-3 px-1.5 sm:px-2">
            <div className="pointer-events-none absolute inset-x-2 top-0 h-6">
              {events.map((event) => {
                const eventType =
                  event.opens > 0 && event.closes > 0
                    ? "mixed"
                    : event.closes > 0
                      ? "close"
                      : "open"

                return (
                  <Tooltip key={event.minute}>
                    <TooltipTrigger asChild>
                      <span
                        className="timeline-event pointer-events-auto"
                        data-event={eventType}
                        style={{ left: `${(event.minute / 360) * 100}%` }}
                        tabIndex={0}
                        aria-label={`Изменения в ${formatMinutes(event.minute)}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={8}>
                      {formatMinutes(event.minute)} · изменений: {event.opens + event.closes}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>

            <Slider
              value={[minute]}
              min={0}
              max={360}
              step={1}
              aria-label="Время на карте"
              aria-valuetext={formatMinutes(minute)}
              className="relative z-10 h-6"
              onValueChange={([value]) => onMinuteChange(value)}
            />

            <div className="relative mt-1 h-5 text-xs tabular-nums text-slate-400">
              {HOUR_MARKS.map((hour) => (
                <span
                  key={hour}
                  className={`absolute -translate-x-1/2 ${hour % 120 === 0 ? "" : "hidden sm:block"}`}
                  style={{ left: `${(hour / 360) * 100}%` }}
                >
                  {formatMinutes(hour)}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-2 text-center text-xs leading-5 text-slate-400 sm:text-left">
            Плановое расписание · фактическая разводка может отличаться
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
