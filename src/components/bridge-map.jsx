import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import { AlertCircle, RefreshCw } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { bridges } from "@/data/bridges"
import { getBridgeStatus, STATUS_CLOSED } from "@/lib/schedule"

const MAP_STYLE = "https://tiles.openfreemap.org/styles/dark"
const cameraBridges = bridges.filter((bridge) => bridge.id !== "volodarsky")

function bridgeMarkerMarkup() {
  return `
    <span class="bridge-marker__visual" aria-hidden="true">
      <svg viewBox="0 0 56 40" role="presentation">
        <path class="bridge-marker__water" d="M7 32c5-3 9-3 14 0s9 3 14 0 9-3 14 0" />
        <path class="bridge-marker__pier" d="M9 27h38" />
        <g class="bridge-marker__leaf bridge-marker__leaf--left">
          <path d="M9 24h19v5H9z" />
          <path class="bridge-marker__rail" d="M10 22h17" />
        </g>
        <g class="bridge-marker__leaf bridge-marker__leaf--right">
          <path d="M28 24h19v5H28z" />
          <path class="bridge-marker__rail" d="M29 22h17" />
        </g>
      </svg>
    </span>
    <span class="bridge-marker__label"></span>
  `
}

export function BridgeMap({ minute, selectedBridgeId, onBridgeSelect }) {
  const containerRef = useRef(null)
  const markerElementsRef = useRef(new Map())
  const onBridgeSelectRef = useRef(onBridgeSelect)
  const minuteRef = useRef(minute)
  const selectedBridgeIdRef = useRef(selectedBridgeId)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  onBridgeSelectRef.current = onBridgeSelect
  minuteRef.current = minute
  selectedBridgeIdRef.current = selectedBridgeId

  useEffect(() => {
    if (!containerRef.current) return undefined

    let hasLoaded = false
    let disposed = false
    let fitFrame = null
    const compact = window.matchMedia("(max-width: 640px)").matches
    const cameraPadding = {
      top: compact ? 112 : 118,
      right: compact ? 36 : 90,
      bottom: compact ? 250 : 210,
      left: compact ? 36 : 90,
    }
    const bounds = cameraBridges.reduce(
      (result, bridge) => result.extend(bridge.coordinates),
      new maplibregl.LngLatBounds(
        cameraBridges[0].coordinates,
        cameraBridges[0].coordinates,
      ),
    )
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [30.34, 59.93],
      zoom: 10.8,
      minZoom: 9,
      maxZoom: 18,
      pitch: 0,
      bearing: 0,
      dragRotate: false,
      pitchWithRotate: false,
      attributionControl: true,
      maxBounds: [
        [29.45, 59.45],
        [31.25, 60.35],
      ],
    })

    const initialCamera = map.cameraForBounds(bounds, {
      padding: cameraPadding,
      maxZoom: 12.2,
    })
    if (initialCamera) map.jumpTo(initialCamera)
    map.touchZoomRotate.disableRotation()
    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: false,
        visualizePitch: false,
      }),
      "top-right",
    )

    const markerElements = new Map()
    const markerInstances = []

    bridges.forEach((bridge) => {
      const element = document.createElement("button")
      const status = getBridgeStatus(bridge, minuteRef.current)

      element.type = "button"
      element.className = "bridge-marker"
      element.dataset.bridgeId = bridge.id
      element.dataset.status = status
      element.dataset.selected = String(
        selectedBridgeIdRef.current === bridge.id,
      )
      element.setAttribute(
        "aria-label",
        `${bridge.name}. Проезд ${status === STATUS_CLOSED ? "закрыт" : "открыт"}`,
      )
      element.style.setProperty("--bridge-label-x", `${bridge.labelOffset[0]}px`)
      element.style.setProperty("--bridge-label-y", `${bridge.labelOffset[1]}px`)
      element.innerHTML = bridgeMarkerMarkup()
      element.querySelector(".bridge-marker__label").textContent = bridge.name
      element.addEventListener("click", () => {
        onBridgeSelectRef.current(bridge.id)
      })

      const marker = new maplibregl.Marker({ element, anchor: "center" })
        .setLngLat(bridge.coordinates)
        .addTo(map)

      markerInstances.push(marker)
      markerElements.set(bridge.id, element)
    })

    markerElementsRef.current = markerElements

    const handleLoad = () => {
      if (disposed) return

      hasLoaded = true
      setMapReady(true)
      setMapError(false)

      const fitAllBridges = () => {
        map.resize()
        const camera = map.cameraForBounds(bounds, {
          padding: cameraPadding,
          maxZoom: 12.2,
        })
        if (camera) map.jumpTo(camera)
      }

      fitFrame = requestAnimationFrame(fitAllBridges)
    }

    const handleError = () => {
      if (!disposed && !hasLoaded) {
        setMapError(true)
        setMapReady(false)
      }
    }

    map.on("load", handleLoad)
    map.on("error", handleError)

    return () => {
      disposed = true
      if (fitFrame !== null) cancelAnimationFrame(fitFrame)
      map.off("load", handleLoad)
      map.off("error", handleError)
      markerInstances.forEach((marker) => marker.remove())
      markerElementsRef.current = new Map()
      map.remove()
    }
  }, [retryKey])

  useEffect(() => {
    bridges.forEach((bridge) => {
      const element = markerElementsRef.current.get(bridge.id)
      if (!element) return

      const status = getBridgeStatus(bridge, minute)
      element.dataset.status = status
      element.dataset.selected = String(selectedBridgeId === bridge.id)
      element.setAttribute(
        "aria-label",
        `${bridge.name}. Проезд ${status === STATUS_CLOSED ? "закрыт" : "открыт"}`,
      )
    })
  }, [minute, selectedBridgeId])

  function retryMap() {
    setMapReady(false)
    setMapError(false)
    setRetryKey((key) => key + 1)
  }

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="size-full" aria-label="Карта Санкт-Петербурга" />

      {!mapReady && !mapError && (
        <div className="absolute inset-0 z-10 bg-slate-950">
          <Skeleton className="size-full rounded-none bg-slate-900" />
          <p className="absolute inset-x-0 top-1/2 text-center text-sm text-slate-400">
            Загружаем карту Петербурга…
          </p>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950/95 px-5">
          <Alert className="max-w-md border-rose-400/25 bg-slate-900 text-slate-100">
            <AlertCircle className="text-rose-300" />
            <AlertTitle>Не удалось загрузить карту</AlertTitle>
            <AlertDescription className="text-slate-400">
              Проверьте подключение к интернету и попробуйте ещё раз.
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={retryMap}
              >
                <RefreshCw />
                Повторить
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
