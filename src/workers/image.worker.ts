import { inspectImage, processImage } from "../lib/engine";
import type { Settings } from "../lib/config";
const scope = self as unknown as {
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: (value: unknown) => void;
};
scope.onmessage = async (
  event: MessageEvent<{
    id: string;
    kind: "inspect" | "process";
    file: File;
    settings?: Settings;
  }>,
) => {
  const { id, kind, file, settings } = event.data;
  try {
    const result =
      kind === "inspect"
        ? await inspectImage(file, () => {})
        : await processImage(
            file,
            settings!,
            () => {},
            (attempt) => scope.postMessage({ id, attempt }),
          );
    scope.postMessage({ id, result });
  } catch (error) {
    scope.postMessage({
      id,
      error: error instanceof Error ? error.message : "processingFailed",
    });
  }
};
