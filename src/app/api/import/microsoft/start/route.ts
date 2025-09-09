import { NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  return new Response(JSON.stringify({ status: "not_implemented", provider: "microsoft_graph" }), {
    status: 501,
    headers: { "content-type": "application/json" },
  });
}
