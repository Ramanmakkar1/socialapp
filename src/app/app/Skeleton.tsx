import type { CSSProperties, ReactNode } from "react";
import s from "./skeleton.module.css";

type BoneProps = { w?: number | string; h?: number | string; r?: number | string; style?: CSSProperties };

/** One grey placeholder block. */
export function Bone({ w = "100%", h = 14, r, style }: BoneProps) {
  return <span className={s.block} style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

/** Wrapper that announces loading to assistive tech and hides the decorative blocks. */
export function SkeletonPage({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={s.wrap} role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className={s.wrap}>{children}</div>
    </div>
  );
}

/** Page title row: icon + title + subtitle, actions on the right. */
export function HeaderSkeleton({ actions = 2 }: { actions?: number }) {
  return (
    <div className={`${s.row} ${s.between}`}>
      <div className={s.row}>
        <Bone w={40} h={40} r={12} />
        <div className={s.grid} style={{ gap: 8 }}>
          <Bone w={180} h={22} />
          <Bone w={260} h={12} />
        </div>
      </div>
      <div className={s.row}>
        {Array.from({ length: actions }, (_, i) => <Bone key={i} w={i === actions - 1 ? 120 : 160} h={40} r={12} />)}
      </div>
    </div>
  );
}

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`${s.grid} ${s.cols4}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={s.card}>
          <Bone w="50%" h={12} />
          <Bone w="35%" h={26} />
          <Bone w="60%" h={10} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, thumb = false }: { rows?: number; thumb?: boolean }) {
  return (
    <div className={s.card}>
      <Bone w="100%" h={18} />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={s.row} style={{ flexWrap: "nowrap" }}>
          {thumb && <Bone w={40} h={40} r={8} style={{ flex: "none" }} />}
          <Bone w={`${40 + ((i * 13) % 30)}%`} h={14} />
          <Bone w="12%" h={14} style={{ marginLeft: "auto" }} />
          <Bone w="10%" h={14} />
        </div>
      ))}
    </div>
  );
}

export function CardRowSkeleton({ count = 5, h = 260 }: { count?: number; h?: number }) {
  return (
    <div className={s.carousel}>
      {Array.from({ length: count }, (_, i) => <Bone key={i} h={h} r={18} />)}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <>
      <div className={`${s.row} ${s.between}`}>
        <div className={s.row}>
          <Bone w={36} h={36} r={10} />
          <Bone w={36} h={36} r={10} />
          <Bone w={200} h={22} />
          <Bone w={70} h={36} r={10} />
          <Bone w={90} h={36} r={10} />
        </div>
        <div className={s.row}>
          <Bone w={130} h={36} r={10} />
          <Bone w={110} h={36} r={10} />
          <Bone w={120} h={14} />
        </div>
      </div>
      <CalendarGridSkeleton />
    </>
  );
}

/** Just the day grid (and the phone agenda), used while the browser time zone is read. */
export function CalendarGridSkeleton() {
  const cells = Array.from({ length: 8 * 5 }, (_, i) => i);
  return (
    <div aria-hidden="true" className={s.wrap}>
      <div className={s.cols7}>
        {cells.map((i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          if (row === 0) return <div key={i} style={{ minHeight: 44, placeItems: "center" }}>{col > 0 && <Bone w="50%" h={12} />}</div>;
          if (col === 0) return <div key={i}><Bone w="70%" h={10} /></div>;
          const filled = (row * 3 + col * 5) % 4 === 0 || (row + col) % 5 === 0;
          return <div key={i}>{filled && <Bone h={58} r={10} />}</div>;
        })}
      </div>
      <div className={s.agenda}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={s.grid} style={{ gap: 8 }}>
            <Bone w={160} h={16} />
            <Bone h={66} r={10} />
            {i % 2 === 0 && <Bone h={66} r={10} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function InboxSkeleton() {
  return (
    <div className={s.split}>
      <div className={s.card} style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {Array.from({ length: 9 }, (_, i) => <Bone key={i} h={78} r={10} />)}
      </div>
      <div className={s.grid}>
        <div className={s.card}>
          <div className={s.row}><Bone w={32} h={32} r={999} /><Bone w={160} h={14} /></div>
          <Bone h={220} r={12} />
          <Bone w="80%" h={12} />
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={s.row} style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
            <Bone w={32} h={32} r={999} style={{ flex: "none" }} />
            <div className={s.grid} style={{ flex: 1, gap: 6 }}><Bone w="30%" h={12} /><Bone w="75%" h={12} /></div>
          </div>
        ))}
        <Bone h={90} r={12} />
      </div>
    </div>
  );
}

/** Whole-dashboard fallback while the session loads: sidebar + generic content. */
export function ShellSkeleton() {
  return (
    <div className={s.shell} role="status" aria-busy="true">
      <span className="sr-only">Loading dashboard</span>
      <aside className={s.side} aria-hidden="true">
        <Bone w={120} h={26} />
        <Bone h={48} r={12} />
        <Bone h={42} r={12} />
        {Array.from({ length: 9 }, (_, i) => <Bone key={i} w={`${55 + ((i * 17) % 35)}%`} h={14} style={{ margin: "6px 8px" }} />)}
      </aside>
      <div className={s.main} aria-hidden="true">
        <div className={s.wrap}>
          <HeaderSkeleton />
          <KpiSkeleton />
          <TableSkeleton />
        </div>
      </div>
    </div>
  );
}
