"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BtnA } from "@/components/ui/kit";

// CSV export link that adds the browser time zone, so the file has a local-time column too.
export default function ExportLeadsLink({ href, children }: { href: string; children: ReactNode }) {
  const [tz, setTz] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser time zone is only known after hydration
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone ?? "");
  }, []);
  const url = tz ? `${href}${href.includes("?") ? "&" : "?"}tz=${encodeURIComponent(tz)}` : href;
  return (
    <BtnA variant="line" href={url} size="sm" download>
      {children}
    </BtnA>
  );
}
