import { getWork } from "../../lib/notion";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const work = await getWork();
  return new Response(JSON.stringify(work), {
    headers: { "Content-Type": "application/json" },
  });
};
