"use client";

import { useState } from "react";
import ui from "@/components/ui/ui.module.css";
import styles from "./settings.module.css";

type Preview = { reply: string } | { notice: string };

const SAMPLE_QUESTION = "Hi! Do you have availability this week?";

function generateSampleResponse(instructions: string | null, bookingLink: string | null): Preview {
  // The example is built only from the saved settings text — nothing is invented.
  const savedInstructions = (instructions ?? "").trim();
  if (savedInstructions === "") return { notice: "No AI reply instructions are saved yet" };
  const savedLink = (bookingLink ?? "").trim();
  return { reply: savedLink === "" ? savedInstructions : `${savedInstructions}\n${savedLink}` };
}

export default function AiReplyPreview({
  instructions,
  bookingLink,
}: {
  instructions: string | null;
  bookingLink: string | null;
}) {
  const [preview, setPreview] = useState<Preview | null>(null);

  return (
    <div className={styles.preview}>
      <div className={styles.previewTop}>
        <div className={styles.previewQuestion}>
          <span className={styles.previewLabel}>Sample customer question</span>
          <p className={styles.previewText}>{SAMPLE_QUESTION}</p>
        </div>
        <button
          type="button"
          className={styles.previewBtn}
          onClick={() => setPreview(generateSampleResponse(instructions, bookingLink))}
        >
          Preview reply
        </button>
      </div>
      {preview && (
        <div role="status" className={styles.previewOutput}>
          {"reply" in preview ? (
            <>
              <span className={styles.previewLabel}>Example reply — illustrative only, nothing is sent</span>
              <div className={styles.previewBubble}>{preview.reply}</div>
            </>
          ) : (
            <p className={`${ui.notice} ${ui.noticeWarn} ${styles.previewNotice}`}>{preview.notice}</p>
          )}
        </div>
      )}
      <p className={ui.hint}>
        The example is built only from your saved instructions and booking link. Previewing never sends an Instagram message and never changes your settings.
      </p>
    </div>
  );
}
