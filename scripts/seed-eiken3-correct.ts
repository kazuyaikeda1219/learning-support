import { createClient } from "@supabase/supabase-js";

type QuestionSeed = {
  book_name: string;
  category?: string | null;
  chapter?: string | null;
  grade_level?: string;
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

// 英検3級 単語 100問
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
    { q: "The food was _____.", opts: ["delicious", "tasty", "yummy", "all"], ans: 1, exp: "delicious = おいしい" },
    { q: "I _____ to the beach yesterday.", opts: ["went", "go", "going", "have gone"], ans: 1, exp: "went = 行った" },
    { q: "The _____ is very cold this winter.", opts: ["weather", "season", "temperature", "climate"], ans: 1, exp: "weather = 天気" },
    { q: "She is _____ tall.", opts: ["quite", "very", "too", "so"], ans: 1, exp: "quite = かなり" },
    { q: "I have a _____ to the party.", opts: ["ticket", "pass", "invitation", "letter"], ans: 3, exp: "invitation = 招待状" },
    { q: "The _____ is very spacious.", opts: ["house", "room", "apartment", "building"], ans: 1, exp: "spacious = 広い" },
    { q: "He _____ his lunch at noon.", opts: ["eats", "ate", "eating", "have eaten"], ans: 1, exp: "eats = 食べる" },
    { q: "The _____ of the building is very high.", opts: ["height", "size", "length", "width"], ans: 1, exp: "height = 高さ" },
    { q: "I _____ coffee every morning.", opts: ["drink", "drinking", "drank", "have drunk"], ans: 1, exp: "drink = 飲む" },
    { q: "She _____ the piano very well.", opts: ["plays", "play", "played", "playing"], ans: 1, exp: "plays = 弾く" },
    { q: "The _____ of the story is interesting.", opts: ["end", "beginning", "middle", "plot"], ans: 4, exp: "plot = ストーリー" },
    { q: "I am _____ in mathematics.", opts: ["interested", "interesting", "good", "bad"], ans: 1, exp: "interested in = ~に興味がある" },
    { q: "The _____ is fresh.", opts: ["bread", "milk", "butter", "cheese"], ans: 1, exp: "bread = パン" },
    { q: "He _____ at the hospital.", opts: ["works", "work", "working", "worked"], ans: 1, exp: "works = 働く" },
    { q: "The _____ is very clean.", opts: ["floor", "wall", "ceiling", "door"], ans: 1, exp: "floor = 床" },
    { q: "I _____ to music while studying.", opts: ["listen", "hear", "sound", "music"], ans: 1, exp: "listen to = ~を聴く" },
    { q: "She _____ a beautiful voice.", opts: ["has", "have", "having", "had"], ans: 1, exp: "has = 持っている" },
    { q: "The _____ is very fast.", opts: ["car", "bus", "train", "airplane"], ans: 4, exp: "airplane = 飛行機" },
    { q: "I _____ my umbrella at school.", opts: ["forgot", "left", "lost", "kept"], ans: 2, exp: "left = 置き忘れた" },
    { q: "The _____ is very deep.", opts: ["river", "lake", "ocean", "sea"], ans: 3, exp: "ocean = 海" },
    { q: "He _____ a doctor.", opts: ["is", "are", "am", "be"], ans: 1, exp: "is = です" },
    { q: "I _____ the exam yesterday.", opts: ["passed", "failed", "took", "won"], ans: 1, exp: "passed = 合格した" },
    { q: "The _____ is very crowded.", opts: ["station", "store", "museum", "library"], ans: 1, exp: "crowded = 混雑している" },
    { q: "She _____ her mother very much.", opts: ["loves", "like", "liked", "loving"], ans: 1, exp: "loves = 愛している" },
    { q: "The _____ is very delicious.", opts: ["cake", "candy", "chocolate", "cookie"], ans: 1, exp: "cake = ケーキ" },
    { q: "I _____ swimming.", opts: ["like", "likes", "liked", "liking"], ans: 1, exp: "like = 好きだ" },
    { q: "The _____ is very big.", opts: ["zoo", "park", "school", "office"], ans: 1, exp: "zoo = 動物園" },
    { q: "He _____ to me every day.", opts: ["talks", "talk", "talked", "talking"], ans: 1, exp: "talks = 話す" },
    { q: "The _____ are very fresh.", opts: ["vegetables", "fruits", "meat", "fish"], ans: 1, exp: "vegetables = 野菜" },
    { q: "I _____ breakfast at 7 AM.", opts: ["eat", "eating", "ate", "have eaten"], ans: 1, exp: "eat = 食べる" },
    { q: "She _____ in the city.", opts: ["lives", "live", "lived", "living"], ans: 1, exp: "lives = 住んでいる" },
    { q: "The _____ is warm.", opts: ["jacket", "coat", "sweater", "shirt"], ans: 2, exp: "coat = コート" },
    { q: "I _____ my friend last week.", opts: ["saw", "see", "seen", "seeing"], ans: 1, exp: "saw = 会った" },
    { q: "The _____ is very skilled.", opts: ["doctor", "teacher", "engineer", "artist"], ans: 1, exp: "doctor = 医者" },
    { q: "He _____ a book.", opts: ["reads", "read", "reading", "have read"], ans: 1, exp: "reads = 読む" },
    { q: "The _____ is very loud.", opts: ["sound", "noise", "music", "voice"], ans: 2, exp: "noise = 騒音" },
    { q: "I _____ my teeth every morning.", opts: ["brush", "clean", "wash", "keep"], ans: 1, exp: "brush = 磨く" },
    { q: "She _____ a student.", opts: ["is", "are", "am", "be"], ans: 1, exp: "is = です" },
    { q: "The _____ are very beautiful.", opts: ["flowers", "trees", "plants", "grass"], ans: 1, exp: "flowers = 花" },
    { q: "I need a _____ for this job.", opts: ["help", "assistant", "person", "hand"], ans: 1, exp: "help = 手助け" },
    { q: "The _____ is very soft.", opts: ["pillow", "bed", "chair", "table"], ans: 1, exp: "pillow = 枕" },
    { q: "He _____ his clothes every week.", opts: ["washes", "wash", "washed", "washing"], ans: 1, exp: "washes = 洗う" },
    { q: "The _____ are very colorful.", opts: ["birds", "insects", "animals", "fish"], ans: 1, exp: "birds = 鳥" },
    { q: "I have a _____ for tomorrow.", opts: ["plan", "meeting", "appointment", "event"], ans: 1, exp: "plan = 計画" },
    { q: "The _____ are very expensive.", opts: ["shoes", "clothes", "books", "toys"], ans: 1, exp: "shoes = 靴" },
    { q: "She _____ every morning.", opts: ["exercises", "exercise", "exercising", "exercised"], ans: 1, exp: "exercises = 運動する" },
    { q: "The _____ is very interesting.", opts: ["article", "story", "book", "movie"], ans: 1, exp: "article = 記事" },
    { q: "I _____ a letter to my friend.", opts: ["wrote", "write", "writing", "have written"], ans: 1, exp: "wrote = 書いた" },
    { q: "The _____ are very sharp.", opts: ["knives", "scissors", "pencils", "pens"], ans: 1, exp: "knives = ナイフ" },
    { q: "He _____ in the gym every day.", opts: ["trains", "train", "training", "trained"], ans: 1, exp: "trains = 訓練する" },
    { q: "The _____ is very warm.", opts: ["blanket", "sheet", "pillow", "mattress"], ans: 1, exp: "blanket = 毛布" },
    { q: "I _____ three languages.", opts: ["speak", "speaks", "speaking", "spoke"], ans: 1, exp: "speak = 話す" },
    { q: "The _____ are very fresh.", opts: ["apples", "oranges", "bananas", "grapes"], ans: 1, exp: "apples = りんご" },
    { q: "She _____ to the university.", opts: ["went", "go", "going", "have gone"], ans: 1, exp: "went = 行った" },
    { q: "The _____ is very dark.", opts: ["room", "house", "building", "cave"], ans: 1, exp: "room = 部屋" },
    { q: "I _____ my room every weekend.", opts: ["clean", "cleans", "cleaning", "cleaned"], ans: 1, exp: "clean = 掃除する" },
    { q: "The _____ is very dangerous.", opts: ["knife", "gun", "bomb", "weapon"], ans: 1, exp: "knife = ナイフ" },
    { q: "He _____ in London.", opts: ["lives", "live", "lived", "living"], ans: 1, exp: "lives = 住んでいる" },
    { q: "The _____ is very large.", opts: ["stadium", "school", "church", "museum"], ans: 1, exp: "stadium = スタジアム" },
    { q: "I _____ to play football.", opts: ["like", "likes", "liked", "liking"], ans: 1, exp: "like = 好きだ" },
    { q: "The _____ is very bright.", opts: ["sun", "light", "lamp", "fire"], ans: 1, exp: "sun = 太陽" },
    { q: "She _____ very hard.", opts: ["studies", "study", "studied", "studying"], ans: 1, exp: "studies = 勉強する" },
    { q: "The _____ is very expensive.", opts: ["car", "bike", "bus", "train"], ans: 1, exp: "car = 車" },
    { q: "I _____ basketball.", opts: ["play", "plays", "played", "playing"], ans: 1, exp: "play = する" },
    { q: "The _____ is very quiet.", opts: ["library", "school", "park", "street"], ans: 1, exp: "library = 図書館" },
    { q: "He _____ in a hotel.", opts: ["works", "work", "working", "worked"], ans: 1, exp: "works = 働く" },
    { q: "The _____ is very cold.", opts: ["water", "ice", "snow", "wind"], ans: 1, exp: "water = 水" },
    { q: "She _____ every day.", opts: ["runs", "run", "running", "ran"], ans: 1, exp: "runs = 走る" },
    { q: "I _____ a book yesterday.", opts: ["read", "reads", "reading", "have read"], ans: 1, exp: "read = 読んだ" },
    { q: "The _____ is very green.", opts: ["grass", "tree", "plant", "leaf"], ans: 1, exp: "grass = 草" },
    { q: "He _____ in Paris.", opts: ["lives", "live", "lived", "living"], ans: 1, exp: "lives = 住んでいる" },
    { q: "The _____ is very blue.", opts: ["sky", "ocean", "sea", "water"], ans: 1, exp: "sky = 空" },
    { q: "I _____ the piano.", opts: ["play", "plays", "played", "playing"], ans: 1, exp: "play = する" },
    { q: "The _____ is very small.", opts: ["bird", "insect", "ant", "bee"], ans: 1, exp: "bird = 鳥" },
    { q: "She _____ in a restaurant.", opts: ["works", "work", "working", "worked"], ans: 1, exp: "works = 働く" },
  ];
  const t = templates[i % templates.length];
  return {
    book_name: "英検3級 単語",
    category: "英単語",
    grade_level: i < 50 ? "中3" : "高1",
    question_text: t.q,
    choice_1: t.opts[0],
    choice_2: t.opts[1],
    choice_3: t.opts[2],
    choice_4: t.opts[3],
    correct_choice: t.ans,
    q_type: "choice",
    subject: "en",
    explanation: t.exp,
  };
});

// 英検3級 文法 100問
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
    { q: "The film _____ I watched last night.", opts: ["that", "which", "what", "when"], ans: 1, exp: "関係詞" },
    { q: "If I were you, I _____ that job.", opts: ["would take", "would have taken", "will take", "take"], ans: 1, exp: "仮定法過去" },
    { q: "I have been waiting _____ for two hours.", opts: ["here", "for", "since", "during"], ans: 1, exp: "have been waiting here" },
    { q: "She insisted _____ going there alone.", opts: ["on", "for", "in", "at"], ans: 1, exp: "insist on -ing" },
    { q: "The children _____ to bed early.", opts: ["were sent", "were send", "are sent", "be sent"], ans: 1, exp: "受動態過去形" },
    { q: "He spoke _____ that everyone could understand.", opts: ["so clearly", "such clearly", "so clear", "such clear"], ans: 1, exp: "so + 副詞" },
    { q: "The box is _____ heavy for me to carry.", opts: ["too", "so", "very", "much"], ans: 1, exp: "too to" },
    { q: "I suggest _____ there again.", opts: ["going", "to go", "go", "goes"], ans: 1, exp: "suggest -ing" },
    { q: "What time _____ you usually wake up?", opts: ["do", "does", "did", "are"], ans: 1, exp: "do you wake up" },
    { q: "_____ I finish this work, I'll call you.", opts: ["As soon as", "Unless", "Although", "Since"], ans: 1, exp: "As soon as" },
    { q: "The team _____ won the championship.", opts: ["that", "which", "what", "who"], ans: 1, exp: "関係詞 that won" },
    { q: "I would rather _____ than go out.", opts: ["stay", "stayed", "staying", "to stay"], ans: 1, exp: "would rather" },
    { q: "The accident _____ have been avoided.", opts: ["could", "would", "might", "can"], ans: 1, exp: "could have" },
    { q: "He is accustomed _____ early.", opts: ["to waking up", "to wake up", "waking up", "for waking up"], ans: 1, exp: "be accustomed to" },
    { q: "I object _____ the plan.", opts: ["to", "for", "on", "in"], ans: 1, exp: "object to" },
    { q: "The book is worth _____.", opts: ["reading", "read", "to read", "being read"], ans: 1, exp: "be worth -ing" },
    { q: "She _____ that she hadn't known about it.", opts: ["said", "told me", "spoke", "mentioned"], ans: 1, exp: "said that" },
    { q: "Not only _____ but also intelligent.", opts: ["he is rich", "is he rich", "he is", "rich is he"], ans: 2, exp: "倒置形" },
    { q: "The soldier was _____ for his bravery.", opts: ["rewarded", "rewarding", "reward", "to reward"], ans: 1, exp: "be rewarded for" },
    { q: "It took him three hours _____ the work.", opts: ["to finish", "finishing", "finish", "finished"], ans: 1, exp: "It took to" },
    { q: "_____ the weather, the game was cancelled.", opts: ["Because of", "In spite of", "Although", "In case of"], ans: 1, exp: "Because of" },
    { q: "He is the man _____ owns the company.", opts: ["that", "who", "whom", "whose"], ans: 2, exp: "who owns" },
    { q: "I'm looking forward _____ you.", opts: ["to seeing", "to see", "seeing", "for seeing"], ans: 1, exp: "look forward to" },
    { q: "He _____ as a doctor for twenty years.", opts: ["has been working", "has worked", "works", "worked"], ans: 1, exp: "現在完了進行形" },
    { q: "The package _____ to you tomorrow.", opts: ["will be sent", "will sent", "is sent", "was sent"], ans: 1, exp: "未来の受動態" },
    { q: "I have no objection _____ what you suggested.", opts: ["to", "for", "in", "on"], ans: 1, exp: "objection to" },
    { q: "The reason _____ he was late is unknown.", opts: ["why", "which", "that", "what"], ans: 1, exp: "why = 理由" },
    { q: "She speaks English _____ fluently as a native.", opts: ["as", "so", "too", "very"], ans: 1, exp: "as as" },
    { q: "I would appreciate it _____ you called me back.", opts: ["if", "unless", "although", "since"], ans: 1, exp: "appreciate it if" },
    { q: "I _____ been studying English for 5 years.", opts: ["have", "has", "had", "am"], ans: 1, exp: "have been" },
    { q: "By the time he arrives, dinner _____.", opts: ["will have been prepared", "will be prepared", "has been prepared", "is prepared"], ans: 1, exp: "未来完了" },
    { q: "The children are _____ to play outside.", opts: ["allowed", "allow", "allowing", "allows"], ans: 1, exp: "be allowed to" },
    { q: "He _____ his hand when he was cooking.", opts: ["burned", "burn", "burning", "have burned"], ans: 1, exp: "burned = やけどした" },
    { q: "We _____ meet again.", opts: ["will", "would", "might", "can"], ans: 1, exp: "will = ~だろう" },
    { q: "The longer you wait, _____ it will be.", opts: ["the harder", "harder", "hardest", "the hardest"], ans: 1, exp: "the harder" },
    { q: "I wish I _____ more time.", opts: ["had", "have", "has", "would have"], ans: 1, exp: "wish I had" },
    { q: "She _____ to London last year.", opts: ["moved", "move", "moving", "have moved"], ans: 1, exp: "moved = 引っ越した" },
    { q: "The teacher _____ us to study hard.", opts: ["encouraged", "encourage", "encouraging", "encourages"], ans: 1, exp: "encouraged = 励ました" },
    { q: "I _____ my homework before dinner.", opts: ["finished", "finish", "finishing", "have finished"], ans: 1, exp: "finished = 終わらせた" },
    { q: "They _____ playing football.", opts: ["are", "is", "were", "was"], ans: 1, exp: "are playing" },
    { q: "The _____ I chose was very good.", opts: ["book", "which book", "book that", "book which"], ans: 3, exp: "book that" },
  ];
  const t = templates[i % templates.length];
  return {
    book_name: "英検3級 文法",
    category: "英文法",
    grade_level: i < 50 ? "中3" : "高1",
    question_text: t.q,
    choice_1: t.opts[0],
    choice_2: t.opts[1],
    choice_3: t.opts[2],
    choice_4: t.opts[3],
    correct_choice: t.ans,
    q_type: "choice",
    subject: "en",
    explanation: t.exp,
  };
});

async function seedQuestions() {
  try {
    const allQuestions = [...vocabQuestions, ...grammarQuestions];

    console.log(
      `\n🚀 英検3級 正規投入開始\n目標: 英検3級 単語 100問 + 英検3級 文法 100問 = ${allQuestions.length}問`
    );

    const { error } = await supabase.from("questions").insert(allQuestions);

    if (error) {
      console.error("❌ エラー:", error);
      process.exit(1);
    }

    console.log(`\n✅ 投入完了！\n`);
    console.log(`📊 結果: 100 + 100 = ${allQuestions.length}問`);
    console.log(`📁 構造:`);
    console.log(`  ├─ 英検3級 単語 ………… 100問`);
    console.log(`  └─ 英検3級 文法 ………… 100問`);
  } catch (err) {
    console.error("❌ エラー:", err);
    process.exit(1);
  }
}

seedQuestions();
