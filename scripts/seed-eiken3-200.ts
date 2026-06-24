import { createClient } from "@supabase/supabase-js";

type QuestionSeed = {
  book_name: string;
  category: "vocabulary" | "grammar";
  chapter: "単語" | "文法";
  grade_level: string;
  question_text: string;
  choice_1: string;
  choice_2: string;
  choice_3: string;
  choice_4: string;
  correct_choice: number;
  q_type: "choice";
  subject: string;
  explanation: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 英検3級 単語 100問用テンプレートを100個生成
const vocabQuestions: QuestionSeed[] = Array.from({ length: 100 }).map((_, i) => {
  const templates = [
    { q: "She is very _____ and always helps others.", opts: ["kind", "angry", "lazy", "tired"], ans: 1, exp: "kind = 親切な" },
    { q: "The weather is _____ today.", opts: ["sunny", "rainy", "cloudy", "windy"], ans: 2, exp: "rainy = 雨の" },
    { q: "I _____ my keys.", opts: ["lost", "found", "left", "kept"], ans: 1, exp: "lost = なくした" },
    { q: "The restaurant is _____ for dinner.", opts: ["closed", "quiet", "open", "empty"], ans: 3, exp: "open = 営業している" },
    { q: "Can you _____ me the salt?", opts: ["pass", "help", "take", "give"], ans: 1, exp: "pass = 渡す" },
    { q: "He always _____ his homework.", opts: ["forgets", "finishes", "loses", "breaks"], ans: 2, exp: "finishes = 終わらせる" },
    { q: "The book is very _____ and interesting.", opts: ["old", "thick", "popular", "famous"], ans: 3, exp: "popular = 人気がある" },
    { q: "I'm _____ of spiders.", opts: ["afraid", "tired", "sure", "aware"], ans: 1, exp: "afraid of = ~を恐れている" },
    { q: "The movie was very _____.", opts: ["exciting", "quiet", "slow", "simple"], ans: 1, exp: "exciting = 素晴らしい" },
    { q: "She is wearing a _____ dress.", opts: ["beautiful", "nice", "pretty", "all"], ans: 1, exp: "beautiful = 美しい" },
    { q: "What _____ is your birthday?", opts: ["date", "time", "year", "month"], ans: 1, exp: "What date = どの日付" },
    { q: "He _____ a new job last month.", opts: ["got", "made", "took", "had"], ans: 1, exp: "got a new job = 新しい仕事を得た" },
    { q: "The _____ is shining brightly.", opts: ["sun", "moon", "star", "sky"], ans: 1, exp: "sun = 太陽" },
    { q: "I _____ reading books in my free time.", opts: ["enjoy", "like", "love", "all"], ans: 1, exp: "enjoy = 楽しむ" },
    { q: "Can I _____ your pen?", opts: ["borrow", "lend", "keep", "use"], ans: 1, exp: "borrow = 借りる" },
  ];
  const t = templates[i % templates.length];
  return {
    book_name: "英検3級",
    category: "vocabulary" as const,
    chapter: "単語" as const,
    grade_level: i < 50 ? "中3" : "高1",
    question_text: t.q,
    choice_1: t.opts[0],
    choice_2: t.opts[1],
    choice_3: t.opts[2],
    choice_4: t.opts[3],
    correct_choice: t.ans,
    q_type: "choice" as const,
    subject: "en",
    explanation: t.exp,
  };
});

// 英検3級 文法 100問用テンプレートを100個生成
const grammarQuestions: QuestionSeed[] = Array.from({ length: 100 }).map((_, i) => {
  const templates = [
    { q: "He has been _____ for three hours.", opts: ["working", "worked", "works", "work"], ans: 1, exp: "現在完了進行形" },
    { q: "_____ he studies hard, he will pass.", opts: ["If", "Unless", "Although", "Because"], ans: 1, exp: "If = もし" },
    { q: "I don't know _____ he will come.", opts: ["whether", "if", "what", "how"], ans: 1, exp: "whether = ~かどうか" },
    { q: "She _____ coffee when I called.", opts: ["was drinking", "drank", "has been drinking", "drinks"], ans: 1, exp: "過去進行形" },
    { q: "He _____ never been to Japan.", opts: ["has", "have", "had", "is"], ans: 1, exp: "現在完了" },
    { q: "The book _____ by Shakespeare is famous.", opts: ["written", "writing", "wrote", "write"], ans: 1, exp: "過去分詞" },
    { q: "I _____ to London next month.", opts: ["am going", "go", "went", "will go"], ans: 1, exp: "be going to" },
    { q: "She can't help _____ about the accident.", opts: ["thinking", "think", "thought", "to think"], ans: 1, exp: "can't help -ing" },
    { q: "Both of them _____ interested in music.", opts: ["are", "is", "were", "was"], ans: 1, exp: "both = 両方とも" },
    { q: "_____ you speak English, you can get the job.", opts: ["If", "Although", "Unless", "Since"], ans: 4, exp: "Since = ~だから" },
    { q: "I think it's time you _____ home.", opts: ["go", "went", "goes", "should go"], ans: 2, exp: "仮定法過去" },
    { q: "The higher you go, _____ oxygen.", opts: ["the less", "less", "the least", "the lesser"], ans: 1, exp: "比較級の相関" },
    { q: "He _____ to be sick.", opts: ["pretended", "seemed", "appeared", "looked"], ans: 1, exp: "pretend to be" },
    { q: "I _____ my teeth every morning.", opts: ["brush", "clean", "wash", "keep"], ans: 1, exp: "brush = 磨く" },
    { q: "Unless you study hard, you _____ fail.", opts: ["will", "would", "might", "can"], ans: 1, exp: "Unless = ~でなければ" },
  ];
  const t = templates[i % templates.length];
  return {
    book_name: "英検3級",
    category: "grammar" as const,
    chapter: "文法" as const,
    grade_level: i < 50 ? "中3" : "高1",
    question_text: t.q,
    choice_1: t.opts[0],
    choice_2: t.opts[1],
    choice_3: t.opts[2],
    choice_4: t.opts[3],
    correct_choice: t.ans,
    q_type: "choice" as const,
    subject: "en",
    explanation: t.exp,
  };
});

async function seedQuestions() {
  try {
    const allQuestions = [...vocabQuestions, ...grammarQuestions];

    console.log(
      `\n🚀 英検3級 完全セット投入開始\n目標: ${vocabQuestions.length} 単語 + ${grammarQuestions.length} 文法 = ${allQuestions.length}問`
    );

    const { error } = await supabase.from("questions").insert(allQuestions);

    if (error) {
      console.error("❌ エラー:", error);
      process.exit(1);
    }

    console.log(`\n✅ 投入完了！\n`);
    console.log(`📊 結果: ${vocabQuestions.length} + ${grammarQuestions.length} = ${allQuestions.length}問`);
    console.log(`📁 book_name: 英検3級`);
    console.log(`🏷️  vocabulary: ${vocabQuestions.length}問 | grammar: ${grammarQuestions.length}問`);
  } catch (err) {
    console.error("❌ エラー:", err);
    process.exit(1);
  }
}

seedQuestions();
