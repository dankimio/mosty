import { useMemo, useState } from "react"
import { ExternalLink, Waves } from "lucide-react"

import { BridgeDetails } from "@/components/bridge-details"
import { BridgeMap } from "@/components/bridge-map"
import { TimelinePanel } from "@/components/timeline-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { bridges } from "@/data/bridges"
import { getInitialMinute, getStatusSummary } from "@/lib/schedule"

const SOURCE_URL =
  "https://www.mostotrest-spb.krti.gov.spb.ru/razvodka-mostov"

function App() {
  const [minute, setMinute] = useState(getInitialMinute)
  const [selectedBridgeId, setSelectedBridgeId] = useState(null)

  const selectedBridge = useMemo(
    () => bridges.find((bridge) => bridge.id === selectedBridgeId) ?? null,
    [selectedBridgeId],
  )
  const summary = useMemo(() => getStatusSummary(bridges, minute), [minute])

  return (
    <main className="dark relative h-svh min-h-[520px] overflow-hidden bg-slate-950 text-slate-100">
      <BridgeMap
        minute={minute}
        selectedBridgeId={selectedBridgeId}
        onBridgeSelect={setSelectedBridgeId}
      />
      <div className="map-vignette" aria-hidden="true" />

      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center px-3 pt-3 sm:justify-start sm:px-5 sm:pt-5">
        <Card className="glass-panel pointer-events-auto w-full max-w-md gap-0 border-white/10 py-0 text-slate-100 shadow-xl shadow-black/30 sm:w-auto sm:max-w-xl sm:min-w-[520px]">
          <CardContent className="flex items-center gap-3 px-4 py-3 sm:px-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-sky-300/15 bg-sky-300/10 text-sky-200">
              <Waves className="size-5" />
            </span>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
                Мосты Петербурга
              </h1>
              <p className="text-xs text-slate-400">
                Состояние автомобильного проезда
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Badge
                variant="outline"
                className="hidden border-sky-300/20 bg-sky-300/5 text-sky-200 sm:inline-flex"
              >
                По расписанию · 2026
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon-sm"
                    className="text-slate-400 hover:bg-white/10 hover:text-white"
                  >
                    <a href={SOURCE_URL} target="_blank" rel="noreferrer">
                      <ExternalLink />
                      <span className="sr-only">Открыть источник расписания</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>
                  Официальный график
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>
      </header>

      <BridgeDetails
        bridge={selectedBridge}
        minute={minute}
        onClose={() => setSelectedBridgeId(null)}
      />

      <TimelinePanel
        minute={minute}
        summary={summary}
        onMinuteChange={setMinute}
      />
    </main>
  )
}

export default App
