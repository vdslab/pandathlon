import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  console.log(req);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Use read instead of pop to avoid deleting the message immediately
  const { data: messages, error } = await supabase
    .schema("pgmq_public")
    .rpc("read", {
      queue_name: "quiz_requests",
      sleep_seconds: 0,
      n: 1,
    });
  console.log(messages);
  console.log(error);

  // Skip processing if queue is empty
  if (!messages || messages.length === 0) {
    console.log("No messages in queue");
    return new Response(JSON.stringify({ message: "No messages in queue" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const { msg_id, message: request } = messages[0];
  console.log("Processing request:", request);

  try {
    // Backend APIにリクエストを送信してクイズを生成
    const backendApiUrl = Deno.env.get("BACKEND_API_URL") ?? "";
    const backendResponse = await fetch(`${backendApiUrl}/api/quizzes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: request.title,
        description: request.description,
        types: request.types.map(({ name }) => name),
        types_description: request.types.map(({ description }) => description),
        questions_count: request.questions_count,
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error(
        `Backend API error: ${backendResponse.status} - ${errorText}`,
      );
    }

    const response = await backendResponse.json();
    console.log(response);

    for (const item of response.quiz_results) {
      console.log(item.base_type, item.image_prompt);
      const backendImageResponse = await fetch(`${backendApiUrl}/api/image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base_type: item.base_type,
          image_prompt: item.image_prompt,
        }),
      });
      if (!backendImageResponse.ok) {
        const errorText = await backendImageResponse.text();
        throw new Error(
          `Backend API error: ${backendResponse.status} - ${errorText}`,
        );
      }
      const imageBlob = await backendImageResponse.blob();
      const file = new File([imageBlob], `${crypto.randomUUID()}.png`, {
        type: "image/png",
      });
      item.image_url = await (async () => {
        const id = crypto.randomUUID();
        const { error } = await supabase.storage
          .from("quiz_result_images")
          .upload(`${id}.png`, file, {
            contentType: "image/png",
          });
        if (error) {
          throw error;
        }
        const { data } = await supabase.storage
          .from("quiz_result_images")
          .getPublicUrl(`${id}.png`);
        return data.publicUrl;
      })();
    }

    const quiz = await (async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .insert({
          creator_id: request.creator_id,
          title: response.quizzes.title,
          description: response.quizzes.description,
          content: "",
        })
        .select();
      if (error) {
        throw error;
      }
      return data[0];
    })();
    console.log(quiz);

    const quizElements = await (async () => {
      const { data, error } = await supabase
        .from("quiz_elements")
        .insert(
          response.quiz_elements.map((item) => {
            return {
              quiz_id: quiz.id,
              content: item.question_text,
            };
          }),
        )
        .select();
      if (error) {
        throw error;
      }
      return data;
    })();
    console.log(quizElements);

    const quizResults = await (async () => {
      const { data, error } = await supabase
        .from("quiz_results")
        .insert(
          response.quiz_results.map((item) => {
            return {
              quiz_id: quiz.id,
              title: item.base_type,
              description: item.description,
              modifier: item.modifier,
              strengths: item.strengths,
              weaknesses: item.weaknesses,
              good_matches: item.good_matches,
              bad_matches: item.bad_matches,
              advice: item.advice,
              image_prompt: item.image_prompt,
            };
          }),
        )
        .select();
      if (error) {
        throw error;
      }
      return data;
    })();
    console.log(quizResults);

    const quizElementScores = [];
    quizElements.forEach((quizElement, i) => {
      for (const quizResult of quizResults) {
        quizElementScores.push({
          quiz_element_id: quizElement.id,
          quiz_result_id: quizResult.id,
          score: response.quiz_elements[i].type_weights[quizResult.title],
        });
      }
    });
    const { data, error } = await supabase
      .from("quiz_element_score")
      .insert(quizElementScores);
    if (error) {
      throw error;
    }
    console.log(data);

    // Delete from quiz_requests table after successful processing (using ID)
    const { error: deleteError } = await supabase
      .from("quiz_requests")
      .delete()
      .eq("id", request.quiz_requests_id);

    if (deleteError) {
      console.error("Error deleting quiz request:", deleteError);
    } else {
      console.log("Quiz request deleted from quiz_requests table");
    }

    // Archive message from PGMQ (remove from queue)
    const { error: archiveError } = await supabase
      .schema("pgmq_public")
      .rpc("archive", {
        queue_name: "quiz_requests",
        message_id: msg_id,
      });
    if (archiveError) {
      throw archiveError;
    }
    console.log("Message archived from PGMQ");

    return new Response(JSON.stringify({ message: "ok", quiz_id: quiz.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing quiz request:", error);
    // On error, the message remains in the queue
    // It will be available for reprocessing after the visibility timeout
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
