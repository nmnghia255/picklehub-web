"use client"

import { RefreshCw, Shuffle } from "lucide-react"
import * as React from "react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useTournamentTranslation } from "@/i18n/use-tournament-translation"

import { useBracketStore } from "../../stores/use-bracket-store"
import type { Bracket } from "../../types/bracket"
import { MatchCard } from "./match-card"

export interface RoundGroup {
  roundName: string
  matches: Bracket[]
}

interface BracketCanvasProps {
  isLoading: boolean
  safeBrackets: Bracket[]
  leftRounds: RoundGroup[]
  rightRounds: RoundGroup[]
  finalRound: RoundGroup | null
  zoom: number
  viewMode: string
  isHost: boolean
  selectedEventId: number | null
  handleGenerateBracket: () => Promise<void>
  isPending: boolean
  setSelectedMatch: (match: Bracket) => void
}

export function BracketCanvas({
  isLoading,
  safeBrackets,
  leftRounds,
  rightRounds,
  finalRound,
  zoom,
  viewMode,
  isHost,
  selectedEventId,
  handleGenerateBracket,
  isPending,
  setSelectedMatch,
}: BracketCanvasProps) {
  const { t } = useTournamentTranslation()
  const resetViewTrigger = useBracketStore((state) => state.resetViewTrigger)

  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const isDraggingRef = useRef(false)
  const hasDraggedRef = useRef(false)

  const clampPan = (x: number, y: number): { x: number; y: number } => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return { x, y }

    const V = container.clientWidth
    const V_h = container.clientHeight

    const unscaledW = content.clientWidth || 500
    const unscaledH = content.clientHeight || 500

    const scale = zoom / 100
    const W = unscaledW * scale
    const H = unscaledH * scale

    const hPadding = 0
    const vPadding = 0

    const maxX =
      W > V ? W / 2 - V / 2 + hPadding : Math.max(0, V / 2 - W / 2 - hPadding)
    const minX =
      W > V ? V / 2 - W / 2 - hPadding : Math.min(0, W / 2 - V / 2 + hPadding)
    const maxY =
      H > V_h
        ? H / 2 - V_h / 2 + vPadding
        : Math.max(0, V_h / 2 - H / 2 - vPadding)
    const minY =
      H > V_h
        ? V_h / 2 - H / 2 - vPadding
        : Math.min(0, H / 2 - V_h / 2 + vPadding)

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    }
  }

  const getInitialPan = () => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return { x: 0, y: 0 }
    const V_h = container.clientHeight
    const H = (content.clientHeight || 500) * (zoom / 100)
    // If content is taller than viewport, start at the top instead of the center
    const y = H > V_h ? V_h / 2 - H / 2 : 0
    return clampPan(0, y)
  }

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    setPan(getInitialPan())
  }, [resetViewTrigger])

  useEffect(() => {
    setPan((prev) => clampPan(prev.x, prev.y))
  }, [zoom])

  // When brackets load, initialize pan to the top of the content
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setPan(getInitialPan())
    })
    return () => cancelAnimationFrame(raf)
  }, [safeBrackets.length])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true
    hasDraggedRef.current = false
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return

    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasDraggedRef.current = true
    }

    setPan(
      clampPan(dragStartRef.current.panX + dx, dragStartRef.current.panY + dy)
    )
  }

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    handleMouseUp()
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    setPan((prev) => clampPan(prev.x - e.deltaX, prev.y - e.deltaY))
  }

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasDraggedRef.current) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onClickCapture={handleContainerClick}
      className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden bg-gray-50/50 select-none"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {isLoading ? (
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium text-gray-500">
            {t("brackets.loading", { defaultValue: "Loading brackets..." })}
          </span>
        </div>
      ) : safeBrackets.length === 0 ? (
        <div className="flex max-w-lg flex-col items-center justify-center text-center">
          <div className="mb-6 animate-bounce rounded-full bg-emerald-50 p-6 text-emerald-600">
            <Shuffle className="h-12 w-12" />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-gray-900">
            {t("brackets.empty.title", {
              defaultValue: "No Bracket Generated",
            })}
          </h3>
          <p className="mb-8 max-w-md text-base leading-relaxed text-gray-500">
            {isHost
              ? t("brackets.empty.descHost", {
                  defaultValue:
                    "Please generate the bracket for this event using the side controller.",
                })
              : t("brackets.empty.descPlayer", {
                  defaultValue:
                    "The organizer has not generated brackets for this event yet.",
                })}
          </p>
          {isHost && selectedEventId && (
            <Button
              onClick={handleGenerateBracket}
              disabled={isPending}
              className="h-auto rounded-xl bg-emerald-600 px-8 py-6 text-base font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-200 hover:bg-emerald-700 hover:shadow-emerald-600/30"
            >
              <Shuffle className="mr-3 h-5 w-5" />
              {t("brackets.sidebar.generateBracket")}
            </Button>
          )}
        </div>
      ) : (
        <div
          ref={contentRef}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
        >
          <div className="inline-flex min-h-[500px] min-w-max items-stretch gap-16 p-10">
            {/* Left Side: Chronological order (largest round to Semifinals) */}
            {leftRounds.map(({ roundName, matches }) => (
              <div
                key={`left-${roundName}`}
                className="flex w-72 shrink-0 flex-col"
              >
                <div className="mb-6 rounded border border-gray-200 bg-gray-100/80 py-1.5 text-center text-xs font-bold tracking-widest text-gray-500 uppercase">
                  {t(`brackets.match.rounds.${roundName}`, {
                    defaultValue: roundName,
                  })}
                </div>
                <div className="flex flex-1 flex-col justify-around gap-6">
                  {matches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      viewMode={viewMode}
                      onClick={() => setSelectedMatch(match)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Center Column: Finals */}
            {finalRound && (
              <div
                key={`final-${finalRound.roundName}`}
                className="flex w-72 shrink-0 flex-col"
              >
                <div className="mb-6 rounded border border-emerald-200 bg-emerald-50/50 py-1.5 text-center text-xs font-bold tracking-widest text-emerald-700 uppercase">
                  {t(`brackets.match.rounds.${finalRound.roundName}`, {
                    defaultValue: finalRound.roundName,
                  })}
                </div>
                <div className="flex flex-1 flex-col justify-around gap-6">
                  {finalRound.matches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      viewMode={viewMode}
                      onClick={() => setSelectedMatch(match)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Right Side: Reverse chronological order (Semifinals to largest round) */}
            {[...rightRounds].reverse().map(({ roundName, matches }) => (
              <div
                key={`right-${roundName}`}
                className="flex w-72 shrink-0 flex-col"
              >
                <div className="mb-6 rounded border border-gray-200 bg-gray-100/80 py-1.5 text-center text-xs font-bold tracking-widest text-gray-500 uppercase">
                  {t(`brackets.match.rounds.${roundName}`, {
                    defaultValue: roundName,
                  })}
                </div>
                <div className="flex flex-1 flex-col justify-around gap-6">
                  {matches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      viewMode={viewMode}
                      onClick={() => setSelectedMatch(match)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
