import { ExternalLink, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  formatMinutes,
  getBridgeStatus,
  getCurrentClosure,
  getNextChange,
  STATUS_CLOSED,
} from "@/lib/schedule"

const SOURCE_URL =
  "https://www.mostotrest-spb.krti.gov.spb.ru/razvodka-mostov"

export function BridgeDetails({ bridge, minute, onClose }) {
  if (!bridge) return null

  const status = getBridgeStatus(bridge, minute)
  const currentClosure = getCurrentClosure(bridge, minute)
  const nextChange = getNextChange(bridge, minute)
  const isClosed = status === STATUS_CLOSED

  return (
    <div className="bridge-details-shell">
      <Card className="glass-panel gap-3 border-white/10 py-4 text-slate-100 shadow-2xl shadow-black/50">
        <CardHeader className="grid-cols-[1fr_auto] gap-3 px-4 sm:px-5">
          <div className="min-w-0">
            <CardTitle className="truncate pr-1 text-base sm:text-lg">
              {bridge.name}
            </CardTitle>
            <Badge
              className={
                isClosed
                  ? "mt-2 border border-rose-300/20 bg-rose-300/10 text-rose-200"
                  : "mt-2 border border-teal-300/20 bg-teal-300/10 text-teal-200"
              }
            >
              Проезд {isClosed ? "закрыт" : "открыт"}
            </Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-slate-400 hover:bg-white/10 hover:text-white"
            onClick={onClose}
            aria-label="Закрыть карточку моста"
          >
            <X />
          </Button>
        </CardHeader>

        <CardContent className="space-y-3 px-4 text-sm sm:px-5">
          <p className="text-slate-300">
            {currentClosure
              ? `Движение откроется в ${formatMinutes(currentClosure[1])}`
              : nextChange
                ? `Следующее закрытие в ${formatMinutes(nextChange.minute)}`
                : "До конца шкалы изменений нет"}
          </p>

          <Separator className="bg-white/10" />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500">Расписание закрытий</span>
            <span className="font-medium tabular-nums text-slate-200">
              {bridge.closures
                .map(
                  ([start, end]) =>
                    `${formatMinutes(start)}–${formatMinutes(end)}`,
                )
                .join(" · ")}
            </span>
          </div>

          <Button
            asChild
            variant="link"
            size="sm"
            className="h-auto justify-start p-0 text-sky-300 hover:text-sky-200"
          >
            <a href={SOURCE_URL} target="_blank" rel="noreferrer">
              Официальный график «Мостотреста»
              <ExternalLink />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
