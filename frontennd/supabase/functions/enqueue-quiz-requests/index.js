import { createClient } from "npm:@supabase/supabase-js@2";

console.log("Hello from Functions!");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { title, description, questions_count, types } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
  const token = req.headers.get("Authorization").replace("Bearer ", "");
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  console.log(user);
  const result = await supabase.schema("pgmq_public").rpc("send", {
    queue_name: "quiz_requests",
    message: {
      title,
      description,
      questions_count,
      types,
      creator_id: user.id,
    },
  });
  console.log(result);

  return new Response(JSON.stringify({ message: "ok" }), {
    headers: { "Content-Type": "application/json" },
  });
});
