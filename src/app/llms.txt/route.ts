import { llmsTxt } from "@/lib/agentDocs";

export const dynamic = "force-static";

/** llms.txt — LLM/エージェント向けのサイト索引(https://llmstxt.org) */
export async function GET() {
  return new Response(llmsTxt(), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
