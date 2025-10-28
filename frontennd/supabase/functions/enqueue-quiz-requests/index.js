// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

console.log("Hello from Functions!");

Deno.serve(async (req) => {
  const data = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
  const token = req.headers.get("Authorization").replace("Bearer ", "");
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  supabase.schema("pgmq_public").rpc("send", {
    queue_name: "quiz_requests",
    message: {
      title,
      description,
      question_count,
      types,
      creator_id: user.id,
    },
  });

  return new Response(JSON.stringify({ message: "ok" }), {
    headers: { "Content-Type": "application/json" },
  });
});
