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

  const message = {
    title,
    description,
    questions_count,
    types,
    creator_id: user.id,
  };

  // Save to quiz_requests table first to get the ID
  const { data: quizRequest, error: insertError } = await supabase
    .from("quiz_requests")
    .insert({
      creator_id: user.id,
      content: message,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error inserting quiz request:", insertError);
    return new Response(
      JSON.stringify({ error: "Failed to create quiz request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Add quiz_requests_id to message and send to PGMQ
  const messageWithId = {
    ...message,
    quiz_requests_id: quizRequest.id,
  };

  const result = await supabase.schema("pgmq_public").rpc("send", {
    queue_name: "quiz_requests",
    message: messageWithId,
  });
  console.log(result);

  return new Response(JSON.stringify({ message: "ok" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
