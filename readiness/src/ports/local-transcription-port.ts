export interface SyntheticAudioFixture {
  fixtureId: string;
  pcm16le: Uint8Array;
  sampleRateHz: 16000;
}

export interface TranscriptionResult {
  text: string;
  confidence?: number;
}

export interface LocalTranscriptionPort {
  isAvailable(): Promise<boolean>;
  transcribe(input: SyntheticAudioFixture): Promise<TranscriptionResult>;
}

/**
 * Test-only reference adapter (C11, design spec Section 3.3): proves the
 * port contract in unit tests only. It is never wired into the CLI's
 * default path and is never accepted as satisfying the mandatory
 * `local-transcription-port` readiness gate in a real deployment context —
 * no concrete production STT adapter exists anywhere in this package.
 */
export function createTestLocalTranscriptionAdapter(): LocalTranscriptionPort {
  return {
    async isAvailable(): Promise<boolean> {
      return true;
    },
    async transcribe(input: SyntheticAudioFixture): Promise<TranscriptionResult> {
      return { text: `synthetic-transcript-${input.fixtureId}`, confidence: 1 };
    },
  };
}
