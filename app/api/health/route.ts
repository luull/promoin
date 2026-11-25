import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return Response.json(
      { status: "unauthorized" },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables are missing");
    return Response.json(
      { status: "error", checkedAt: new Date().toISOString() },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }

  const startedAt = Date.now();
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const { error } = await supabase.from("outlets").select("id").limit(1);

  if (error) {
    console.error("Supabase health check failed:", error.message);
    return Response.json(
      {
        status: "error",
        checkedAt: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
      },
      { status: 503, headers: NO_STORE_HEADERS },
    );
  }

  return Response.json(
    {
      status: "ok",
      database: "reachable",
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
    },
    { headers: NO_STORE_HEADERS },
  );
}
