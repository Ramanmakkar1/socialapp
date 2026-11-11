import Link from "next/link";
import s from "./site.module.css";

/** Month the competitor comparison tables were last checked against public info. */
export const COMPARED_ON = "November 2026";

/** Small note under every competitor comparison table. */
export function CompareNote() {
  return (
    <p className="small" style={{ textAlign: "center", marginTop: 12 }}>
      Compared in {COMPARED_ON} from public info. Something changed?{" "}
      <Link className={s.vlink} href="/contact">Tell us</Link> and we will update it.
    </p>
  );
}
