import { useCallback, useMemo, useRef, useState } from "react"
import { LOCALE } from "../../theme"
import { Card, SH } from "../UI"
import CardActionBar from "../CardActionBar"
import { ACTION_BAR_OFFSET } from "../cardActions"
import {
  applyQuadrants,
  buildMatrixBuRows,
  computeMatrixYMax,
  DEFAULT_ADOPTION_THRESHOLD,
  DEFAULT_INTENSITY_THRESHOLD,
  MATRIX_QUADRANTS,
  QUADRANT_LEGEND,
} from "../../data/adoptionIntensityMatrix"

const PLOT = { w: 920, h: 520, ml: 58, mr: 28, mt: 24, mb: 48 }
const plotW = PLOT.w - PLOT.ml - PLOT.mr
const plotH = PLOT.h - PLOT.mt - PLOT.mb

function xScale(adoption, xMax = 100) {
  return PLOT.ml + (adoption / xMax) * plotW
}

function yScale(intensity, yMax) {
  return PLOT.mt + plotH - (intensity / yMax) * plotH
}

function adoptionFromPx(px, xMax = 100) {
  return Math.max(5, Math.min(95, ((px - PLOT.ml) / plotW) * xMax))
}

function intensityFromPy(py, yMax) {
  return Math.max(5, Math.min(yMax - 5, ((PLOT.mt + plotH - py) / plotH) * yMax))
}

function deptLabelLines(name) {
  if (name === "Sales & Partnerships") return ["Sales &", "Partnerships"]
  if (name === "Data & Analytics") return ["Data &", "Analytics"]
  if (name === "Risk & Compliance") return ["Risk &", "Compliance"]
  if (name === "Customer Support") return ["Customer", "Support"]
  if (name.length > 16) {
    const mid = name.lastIndexOf(" ", Math.ceil(name.length / 2))
    if (mid > 0) return [name.slice(0, mid), name.slice(mid + 1)]
  }
  return [name]
}

function QuadrantBadge({ label, color }) {
  return (
    <span className="adopt-matrix__badge" style={{ color, borderColor: `${color}44`, background: `${color}14` }}>
      {label}
    </span>
  )
}

function DepartmentDetailCard({ row, onClose }) {
  return (
    <div className="adopt-matrix__detail-panel">
      <div className="adopt-matrix__card-head">
        <strong>{row.displayName}</strong>
        <div className="adopt-matrix__card-head-actions">
          <QuadrantBadge label={row.quadrantLabel} color={row.quadrantColor} />
          <button type="button" className="adopt-matrix__detail-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
      </div>
      <ul className="adopt-matrix__card-list adopt-matrix__card-list--horizontal">
        <li>
          <span>Adoption</span>
          <span>
            {row.active.toLocaleString(LOCALE)} / {row.total.toLocaleString(LOCALE)} active ({row.adoption}%)
          </span>
        </li>
        <li>
          <span>Intensity</span>
          <span>{row.intensity} credits / active user / week</span>
        </li>
        <li>
          <span>Untapped</span>
          <span>{row.nonAdopt.toLocaleString(LOCALE)} non-adopters</span>
        </li>
        <li>
          <span>Volume</span>
          <span>{row.credits.toLocaleString(LOCALE)} credits (3 months)</span>
        </li>
      </ul>
      <p className="adopt-matrix__card-action-line">
        <span>Action</span> {row.quadrantAction}
      </p>
    </div>
  )
}

export default function AdoptionIntensityMatrix({ deptRows, kpis, onOpenInsights }) {
  const weeks = kpis?.weeks ?? 13
  const svgRef = useRef(null)
  const [adoptionThreshold, setAdoptionThreshold] = useState(DEFAULT_ADOPTION_THRESHOLD)
  const [intensityThreshold, setIntensityThreshold] = useState(DEFAULT_INTENSITY_THRESHOLD)
  const [selectedBu, setSelectedBu] = useState(null)
  const [hoveredBu, setHoveredBu] = useState(null)
  const [dragging, setDragging] = useState(null)

  const baseRows = useMemo(() => buildMatrixBuRows(deptRows, weeks), [deptRows, weeks])
  const yMax = useMemo(() => computeMatrixYMax(baseRows), [baseRows])
  const rows = useMemo(
    () => applyQuadrants(baseRows, adoptionThreshold, intensityThreshold),
    [baseRows, adoptionThreshold, intensityThreshold]
  )

  const xLine = xScale(adoptionThreshold)
  const yLine = yScale(intensityThreshold, yMax)

  const quadrantRects = useMemo(() => {
    const xSplit = xScale(adoptionThreshold)
    const ySplit = yScale(intensityThreshold, yMax)
    const right = PLOT.ml + plotW
    const top = PLOT.mt
    const bottom = PLOT.mt + plotH
    return [
      { id: "scale", x: PLOT.ml, y: top, w: xSplit - PLOT.ml, h: ySplit - top },
      { id: "champions", x: xSplit, y: top, w: right - xSplit, h: ySplit - top },
      { id: "lowfit", x: PLOT.ml, y: ySplit, w: xSplit - PLOT.ml, h: bottom - ySplit },
      { id: "investigate", x: xSplit, y: ySplit, w: right - xSplit, h: bottom - ySplit },
    ]
  }, [adoptionThreshold, intensityThreshold, yMax])

  const clientToSvg = useCallback((clientX, clientY) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svg.getScreenCTM()?.inverse()
    if (!ctm) return { x: 0, y: 0 }
    const { x, y } = pt.matrixTransform(ctm)
    return { x, y }
  }, [])

  const onPointerMove = useCallback(
    (e) => {
      if (!dragging) return
      const { x, y } = clientToSvg(e.clientX, e.clientY)
      if (dragging === "adoption") setAdoptionThreshold(Math.round(adoptionFromPx(x) * 10) / 10)
      if (dragging === "intensity") setIntensityThreshold(Math.round(intensityFromPy(y, yMax) * 10) / 10)
    },
    [dragging, clientToSvg, yMax]
  )

  const endDrag = useCallback(() => setDragging(null), [])

  const resetThresholds = () => {
    setAdoptionThreshold(DEFAULT_ADOPTION_THRESHOLD)
    setIntensityThreshold(DEFAULT_INTENSITY_THRESHOLD)
  }

  const xTicks = [0, 20, 40, 60, 80, 100]
  const yTicks = useMemo(() => {
    const step = yMax <= 100 ? 20 : 40
    const ticks = []
    for (let v = 0; v <= yMax; v += step) ticks.push(v)
    if (ticks[ticks.length - 1] !== yMax) ticks.push(yMax)
    return ticks
  }, [yMax])

  const selectedRow = rows.find((r) => r.id === selectedBu)

  return (
    <Card>
      <CardActionBar
        info={{
          title: "How to read this matrix",
          items: [
            "X = adoption rate (active users ÷ BU headcount). Y = credits per active user per week.",
            "Bubble size = non-adopters (absolute gap). Drag divider lines to reclassify BUs.",
            "Click a bubble for a department summary. Quadrant colors drive recommended action.",
          ],
        }}
        insights={onOpenInsights ? () => onOpenInsights({
          insightIds: ["adoption-intensity-prioritization", "high-intensity-incomplete-rollout"],
          title: "Adoption × Intensity matrix",
          subtitle: "Where to push adoption first",
        }) : null}
      />

      <div style={{ paddingRight: ACTION_BAR_OFFSET }}>
        <SH
          title="Adoption × Intensity matrix"
          sub={`${weeks}-week snapshot · bubble size = untapped headcount · click a department · drag thresholds to explore`}
        />
      </div>

      <div className="adopt-matrix__chart-wrap">
        <div className="adopt-matrix__chart-toolbar">
          <span className="adopt-matrix__threshold-readout">
            Adoption ≥ {adoptionThreshold}% · Intensity ≥ {intensityThreshold} cr/wk
          </span>
          <button type="button" className="adopt-matrix__reset" onClick={resetThresholds}>
            Reset
          </button>
        </div>

        <div className="adopt-matrix__plot-stage">
          <svg
            ref={svgRef}
            className="adopt-matrix__svg"
            viewBox={`0 0 ${PLOT.w} ${PLOT.h}`}
            role="img"
            aria-label="Adoption versus intensity matrix by business unit"
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onClick={() => setSelectedBu(null)}
          >
          <rect
            x={PLOT.ml}
            y={PLOT.mt}
            width={plotW}
            height={plotH}
            rx={12}
            className="adopt-matrix__plot-bg"
          />

          {quadrantRects.map((q) => {
            const def = MATRIX_QUADRANTS[q.id]
            return (
              <g key={q.id}>
                <rect
                  x={q.x}
                  y={q.y}
                  width={Math.max(0, q.w)}
                  height={Math.max(0, q.h)}
                  fill={def.fill}
                  pointerEvents="none"
                />
                <text
                  x={q.x + 10}
                  y={q.y + 18}
                  className="adopt-matrix__quadrant-label"
                  fill={def.color}
                  pointerEvents="none"
                >
                  {def.label}
                </text>
              </g>
            )
          })}

          {yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={PLOT.ml}
                x2={PLOT.ml + plotW}
                y1={yScale(tick, yMax)}
                y2={yScale(tick, yMax)}
                className="adopt-matrix__grid"
              />
              <text x={PLOT.ml - 10} y={yScale(tick, yMax) + 4} className="adopt-matrix__tick" textAnchor="end">
                {tick}
              </text>
            </g>
          ))}

          {xTicks.map((tick) => (
            <g key={`x-${tick}`}>
              <line
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={PLOT.mt}
                y2={PLOT.mt + plotH}
                className="adopt-matrix__grid"
              />
              <text x={xScale(tick)} y={PLOT.mt + plotH + 20} className="adopt-matrix__tick" textAnchor="middle">
                {tick}%
              </text>
            </g>
          ))}

          <text
            x={PLOT.ml + plotW / 2}
            y={PLOT.h - 8}
            className="adopt-matrix__axis-title"
            textAnchor="middle"
          >
            Adoption rate (% active ÷ headcount)
          </text>
          <text
            x={16}
            y={PLOT.mt + plotH / 2}
            className="adopt-matrix__axis-title"
            textAnchor="middle"
            transform={`rotate(-90 16 ${PLOT.mt + plotH / 2})`}
          >
            Intensity (credits / active user / week)
          </text>

          <line
            x1={xLine}
            x2={xLine}
            y1={PLOT.mt}
            y2={PLOT.mt + plotH}
            className="adopt-matrix__divider adopt-matrix__divider--v"
          />
          <line
            x1={PLOT.ml}
            x2={PLOT.ml + plotW}
            y1={yLine}
            y2={yLine}
            className="adopt-matrix__divider adopt-matrix__divider--h"
          />

          <rect
            x={xLine - 6}
            y={PLOT.mt}
            width={12}
            height={plotH}
            className="adopt-matrix__divider-handle adopt-matrix__divider-handle--v"
            onPointerDown={(e) => {
              e.stopPropagation()
              e.currentTarget.setPointerCapture(e.pointerId)
              setDragging("adoption")
            }}
          />
          <rect
            x={PLOT.ml}
            y={yLine - 6}
            width={plotW}
            height={12}
            className="adopt-matrix__divider-handle adopt-matrix__divider-handle--h"
            onPointerDown={(e) => {
              e.stopPropagation()
              e.currentTarget.setPointerCapture(e.pointerId)
              setDragging("intensity")
            }}
          />

          {rows.map((row) => {
            const cx = xScale(row.adoption)
            const cy = yScale(row.intensity, yMax)
            const r = row.bubbleRadius
            const isSelected = selectedBu === row.id
            const isHovered = hoveredBu === row.id
            const labelLines = deptLabelLines(row.displayName)
            const labelY = cy + r + 16

            return (
              <g
                key={row.id}
                className={`adopt-matrix__bubble${isSelected ? " adopt-matrix__bubble--selected" : ""}`}
                onMouseEnter={() => setHoveredBu(row.id)}
                onMouseLeave={() => setHoveredBu((prev) => (prev === row.id ? null : prev))}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedBu((prev) => (prev === row.id ? null : row.id))
                }}
              >
                {isSelected && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + 5}
                    fill="none"
                    stroke={row.quadrantColor}
                    strokeWidth={2}
                    opacity={0.55}
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={row.quadrantColor}
                  fillOpacity={isSelected || isHovered ? 0.92 : 0.72}
                  stroke={row.borderline ? row.quadrantColor : "#fff"}
                  strokeWidth={row.borderline ? 2.5 : 2}
                  strokeDasharray={row.borderline ? "5 3" : undefined}
                />
                <text
                  x={cx}
                  y={labelY}
                  className="adopt-matrix__bubble-label"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {labelLines.map((line, i) => (
                    <tspan key={i} x={cx} dy={i === 0 ? 0 : 12}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            )
          })}
          </svg>

          {selectedRow && (
            <div
              className="adopt-matrix__overlay"
              onClick={(e) => e.stopPropagation()}
            >
              <DepartmentDetailCard row={selectedRow} onClose={() => setSelectedBu(null)} />
            </div>
          )}
        </div>

        <div className="adopt-matrix__legend" aria-label="Quadrant legend">
          <div className="adopt-matrix__legend-title">Quadrants</div>
          <div className="adopt-matrix__legend-grid">
            {QUADRANT_LEGEND.map((q) => (
              <div key={q.id} className="adopt-matrix__legend-item">
                <div className="adopt-matrix__legend-head">
                  <span
                    className="adopt-matrix__legend-swatch"
                    style={{ background: q.color, boxShadow: `0 0 0 3px ${q.color}22` }}
                  />
                  <div>
                    <div className="adopt-matrix__legend-label" style={{ color: q.color }}>
                      {q.label}
                    </div>
                    <div className="adopt-matrix__legend-axes">{q.axes}</div>
                  </div>
                </div>
                <p className="adopt-matrix__legend-desc">{q.tooltip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
