export interface DeletionReceipt {
  receiptId: string;
  subject: string;
  deletedAt: string;
  rehearsal: true;
}

function receiptFor(prefix: string, subject: string, now: Date): DeletionReceipt {
  return {
    receiptId: `${prefix}_${subject}_${now.getTime()}`,
    subject,
    deletedAt: now.toISOString(),
    rehearsal: true,
  };
}

const RAW_AUDIO_GRACE_HOURS = 72;

/** Protocol §11: raw-founder-audio synthetic 72-hour grace period. This is a
 * rehearsal receipt only — it never represents an actual deletion of actual
 * data, since no actual data exists in this harness. */
export function rehearseRawAudioRetention(
  fixtureId: string,
  now: Date,
): { receipt: DeletionReceipt; graceHoursElapsed: number; graceWindowHours: number } {
  return {
    receipt: receiptFor("raw-audio-deletion", fixtureId, now),
    graceHoursElapsed: 0,
    graceWindowHours: RAW_AUDIO_GRACE_HOURS,
  };
}

/** Protocol §5: unused-reserve deletion receipt at replacement-window close. */
export function rehearseUnusedReserveDeletion(caseId: string, now: Date): DeletionReceipt {
  return receiptFor("unused-reserve-deletion", caseId, now);
}

/** Protocol §18-19, §24: full-VOD deletion-after-required-reviews, rehearsed only. */
export function rehearseFullVodDeletionAfterGold(vodRef: string, now: Date): DeletionReceipt {
  return receiptFor("full-vod-deletion-after-gold", vodRef, now);
}
