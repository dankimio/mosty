export const STATUS_OPEN = "open"
export const STATUS_CLOSED = "closed"

export function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  return `${String(hours).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
}

export function getBridgeStatus(bridge, minute) {
  return bridge.closures.some(
    ([start, end]) => minute >= start && minute < end,
  )
    ? STATUS_CLOSED
    : STATUS_OPEN
}

export function getCurrentClosure(bridge, minute) {
  return (
    bridge.closures.find(
      ([start, end]) => minute >= start && minute < end,
    ) ?? null
  )
}

export function getNextChange(bridge, minute) {
  const events = bridge.closures
    .flatMap(([start, end]) => [
      { minute: start, status: STATUS_CLOSED },
      { minute: end, status: STATUS_OPEN },
    ])
    .sort((a, b) => a.minute - b.minute)

  return events.find((event) => event.minute > minute) ?? null
}

export function getStatusSummary(bridgeList, minute) {
  const closed = bridgeList.filter(
    (bridge) => getBridgeStatus(bridge, minute) === STATUS_CLOSED,
  ).length

  return {
    open: bridgeList.length - closed,
    closed,
  }
}

export function getScheduleEvents(bridgeList) {
  const eventsByMinute = new Map()

  bridgeList.forEach((bridge) => {
    bridge.closures.forEach(([start, end]) => {
      const startEvent = eventsByMinute.get(start) ?? {
        minute: start,
        opens: 0,
        closes: 0,
      }
      startEvent.closes += 1
      eventsByMinute.set(start, startEvent)

      const endEvent = eventsByMinute.get(end) ?? {
        minute: end,
        opens: 0,
        closes: 0,
      }
      endEvent.opens += 1
      eventsByMinute.set(end, endEvent)
    })
  })

  return [...eventsByMinute.values()].sort((a, b) => a.minute - b.minute)
}

export function getInitialMinute(date = new Date()) {
  const parts = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  const hour = Number(parts.find((part) => part.type === "hour")?.value)
  const minute = Number(parts.find((part) => part.type === "minute")?.value)
  const totalMinutes = hour * 60 + minute

  return totalMinutes >= 0 && totalMinutes <= 360 ? totalMinutes : 60
}
