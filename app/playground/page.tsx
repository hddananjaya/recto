import { isAiConfigured } from "@/lib/ai/config";

import { PlaygroundClient } from "./playground-client";

export default function PlaygroundPage() {
  return <PlaygroundClient aiConfigured={isAiConfigured()} />;
}
