Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization") },
      },
    },
  );

  const request = await supabase
    .schema("pgmq_public")
    .rpc("pop", { queue_name: "quiz_requests" });
  console.log(request);

  // TODO dataの内容からLLMにリクエストを行いresponseを取得する
  const response = {
    quizzes: {
      title: "仕事の働き方診断",
      description: "あなたの仕事のスタイルを診断します。",
      scale_type: "7-point (-3〜+3)",
      theme: "仕事の働き方",
      created_by: "system",
    },
    quiz_elements: [
      {
        id: 1,
        question_text:
          "チームで意見が分かれたとき、自分が主導して方向性を決めたい",
        type_weights: {
          リーダー型: 3,
          サポート型: -2,
          クリエイティブ型: 0,
          ルーティン型: -1,
        },
      },
      {
        id: 2,
        question_text: "誰かの仕事を手伝ったり、サポートすることに喜びを感じる",
        type_weights: {
          リーダー型: -1,
          サポート型: 3,
          クリエイティブ型: 0,
          ルーティン型: -2,
        },
      },
      {
        id: 3,
        question_text: "新しいアイデアや斬新な方法を考え出すことが得意だ",
        type_weights: {
          リーダー型: 0,
          サポート型: -1,
          クリエイティブ型: 3,
          ルーティン型: -2,
        },
      },
      {
        id: 4,
        question_text: "決まった手順やルールに従って正確に仕事をするのが好きだ",
        type_weights: {
          リーダー型: -2,
          サポート型: 0,
          クリエイティブ型: -1,
          ルーティン型: 3,
        },
      },
      {
        id: 5,
        question_text: "プロジェクト全体の責任を持ち、結果にコミットしたい",
        type_weights: {
          リーダー型: 3,
          サポート型: -1,
          クリエイティブ型: 1,
          ルーティン型: -3,
        },
      },
      {
        id: 6,
        question_text: "他人の成功を支えることに大きなやりがいを感じる",
        type_weights: {
          リーダー型: -2,
          サポート型: 3,
          クリエイティブ型: -1,
          ルーティン型: 0,
        },
      },
      {
        id: 7,
        question_text: "既存の枠にとらわれず、自由な発想で仕事をしたい",
        type_weights: {
          リーダー型: 1,
          サポート型: -2,
          クリエイティブ型: 3,
          ルーティン型: -2,
        },
      },
      {
        id: 8,
        question_text: "毎日同じペースで安定して業務をこなす方が安心する",
        type_weights: {
          リーダー型: -3,
          サポート型: 1,
          クリエイティブ型: -2,
          ルーティン型: 4,
        },
      },
      {
        id: 9,
        question_text: "リスクを取ってでも、大きな目標に挑戦したい",
        type_weights: {
          リーダー型: 3,
          サポート型: -3,
          クリエイティブ型: 2,
          ルーティン型: -2,
        },
      },
      {
        id: 10,
        question_text: "チームの調和を保ち、円滑なコミュニケーションを重視する",
        type_weights: {
          リーダー型: 0,
          サポート型: 3,
          クリエイティブ型: -1,
          ルーティン型: -2,
        },
      },
    ],
    quiz_results: [
      {
        base_type: "リーダー型",
        modifier: "頼れる",
        description:
          "組織を牽引し、明確なビジョンで周囲を導く天性のリーダー。決断力と実行力に優れ、責任感を持って目標達成に邁進します。困難な状況でも冷静に判断し、チーム全体を成功へと導く力があります。",
        strengths: [Array],
        weeknesses: [Array],
        good_match: [Object],
        advice:
          "時には一歩引いて、チームメンバーの声に耳を傾ける時間を作りましょう。あなたの決断力は素晴らしいですが、多様な意見を取り入れることでさらに強 固な戦略が生まれます。定期的に1on1の時間を設け、信頼関係を深めることが長期的な成功につながります。",
      },
      {
        base_type: "サポート型",
        modifier: "献身的な",
        description:
          "チームの縁の下の力持ちとして、周囲を支える温かい存在。他者のニーズを敏感に察知し、適切なサポートを提供する能力に長けています。協調性が高く、組織全体の調和を保つ重要な役割を果たします。",
        strengths: [Array],
        weeknesses: [Array],
        good_match: [Object],
        advice:
          "あなたの献身は素晴らしいですが、時には自分の意見や希望をしっかり伝えることも大切です。週に一度は自分のための時間を確保し、キャリアの目標を 見直しましょう。適切に「ノー」と言う練習をすることで、より持続可能なサポートができるようになります。",
      },
      {
        base_type: "クリエイティブ型",
        modifier: "革新的な",
        description:
          "既成概念にとらわれない自由な発想で、新しい価値を生み出すイノベーター。独創的なアイデアと柔軟な思考で、組織に新鮮な風を吹き込みます。変化を恐れず、常に次の可能性を追求する姿勢が魅力です。",
        strengths: [Array],
        weeknesses: [Array],
        good_match: [Object],
        advice:
          "素晴らしいアイデアを持っているあなたには、それを形にする実行力も必要です。アイデアをメモする習慣をつけ、優先順位をつけて一つずつ実現させま しょう。信頼できる実務担当者とタッグを組むことで、あなたの創造性が最大限に活かされます。",
      },
      {
        base_type: "ルーティン型",
        modifier: "堅実な",
        description:
          "確実性と安定性を重視し、着実に成果を積み上げる信頼のプロフェッショナル。決められた手順を正確に遂行する能力に優れ、組織の基盤を支えます。計画的で丁寧な仕事ぶりは、周囲に安心感を与えます。",
        strengths: [Array],
        weeknesses: [Array],
        good_match: [Object],
        advice:
          "あなたの安定感は組織にとって貴重な財産ですが、時には小さなチャレンジも取り入れてみましょう。月に一つ、新しいスキルや方法を試す目標を立てる ことで、さらなる成長が期待できます。変化を恐れず、あなたの堅実さと新しい挑戦を組み合わせることが、キャリアの幅を広げます。",
      },
    ],
  };

  const {
    data: [quiz],
  } = await supabase
    .from("quizzes")
    .insert({
      creator_id: request.creator_id,
      title: response.quizzes.title,
      description: response.quizzes.description,
    })
    .select();
  console.log(quiz);
  const { data: quizElements } = await supabase
    .from("quiz_elements")
    .insert([
      response.quiz_elements.map((item) => {
        return {
          quiz_id: quiz.id,
          content: item.question_text,
        };
      }),
    ])
    .select();
  console.log(quizElements);
  const { data: quizResults } = await supabase
    .from("quiz_results")
    .insert([
      response.quiz_results.map((item) => {
        return {
          quiz_id: quiz.id,
          title: item.base_type,
          content: item.description,
        };
      }),
    ])
    .select();
  console.log(quizResults);
  const quizElementScores = [];
  quizElements.forEach((quizElement, i) => {
    for (const quizResult of quizResults) {
      elementScores.push({
        quiz_element_id: quizElement.id,
        quiz_result_id: quizResult.id,
        score: response.quiz_elements[i].type_weights[quizResult.title],
      });
    }
  });
  const { data } = await supabase
    .from("quiz_element_score")
    .insert(quizElementScores);
  console.log(data);

  return new Response(JSON.stringify({ message: "ok" }), {
    headers: { "Content-Type": "application/json" },
  });
});
