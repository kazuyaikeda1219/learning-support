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

// 英検3級 単語問題テンプレート（100問分）
const vocabularyTemplates = [
  {
    q: "She is very _____ and always helps others.",
    opts: ["kind", "angry", "lazy", "tired"],
    ans: 1,
    exp: "kind = 親切な。人を助ける性質を表す",
  },
  {
    q: "The weather is _____ today, so we can't play outside.",
    opts: ["sunny", "rainy", "cloudy", "windy"],
    ans: 2,
    exp: "rainy = 雨の。外で遊べない→雨",
  },
  {
    q: "I _____ my keys. I can't find them.",
    opts: ["lost", "found", "left", "kept"],
    ans: 1,
    exp: "lost = なくした。can't find them = 見つけられない",
  },
  {
    q: "The restaurant is _____ for dinner. Let's go there.",
    opts: ["closed", "quiet", "open", "empty"],
    ans: 3,
    exp: "open = 営業している。行くから営業中",
  },
  {
    q: "Can you _____ me the salt, please?",
    opts: ["pass", "help", "take", "give"],
    ans: 1,
    exp: "pass = 渡す。物を人に渡す時の表現",
  },
  {
    q: "He always _____ his homework on time.",
    opts: ["forgets", "finishes", "loses", "breaks"],
    ans: 2,
    exp: "finishes = 終わらせる。homework on time = 時間通りに宿題",
  },
  {
    q: "The book is very _____ and interesting.",
    opts: ["old", "thick", "popular", "famous"],
    ans: 3,
    exp: "popular = 人気がある。interesting = 面白い",
  },
  {
    q: "I'm _____ of spiders.",
    opts: ["afraid", "tired", "sure", "aware"],
    ans: 1,
    exp: "afraid of = ~を恐れている。spiders = クモ",
  },
  {
    q: "The movie was very _____.",
    opts: ["exciting", "quiet", "slow", "simple"],
    ans: 1,
    exp: "exciting = 興奮させる、素晴らしい。映画を修飾",
  },
  {
    q: "She is wearing a _____ dress.",
    opts: ["beautiful", "nice", "pretty", "all"],
    ans: 1,
    exp: "beautiful = 美しい。dress = ドレス",
  },
  {
    q: "What _____ is your birthday?",
    opts: ["date", "time", "year", "month"],
    ans: 1,
    exp: "What date = どの日付。日付を聞く時の表現",
  },
  {
    q: "He _____ a new job last month.",
    opts: ["got", "made", "took", "had"],
    ans: 1,
    exp: "got a new job = 新しい仕事を得た。過去形",
  },
  {
    q: "The _____ is shining brightly.",
    opts: ["sun", "moon", "star", "sky"],
    ans: 1,
    exp: "shining brightly = 明るく輝く→太陽",
  },
  {
    q: "I _____ reading books in my free time.",
    opts: ["enjoy", "like", "love", "all"],
    ans: 1,
    exp: "enjoy = 楽しむ。enjoy + -ing の形",
  },
  {
    q: "Can I _____ your pen?",
    opts: ["borrow", "lend", "keep", "use"],
    ans: 1,
    exp: "borrow = 借りる。相手から借りる時の表現",
  },
  {
    q: "The food was _____.",
    opts: ["delicious", "tasty", "yummy", "all"],
    ans: 1,
    exp: "delicious = おいしい。食べ物の味を表す",
  },
  {
    q: "I _____ to the beach yesterday.",
    opts: ["went", "go", "going", "have gone"],
    ans: 1,
    exp: "went = 行った。yesterday → 過去形",
  },
  {
    q: "The _____ is very cold this winter.",
    opts: ["weather", "season", "temperature", "climate"],
    ans: 1,
    exp: "weather = 天気。cold this winter = この冬寒い",
  },
  {
    q: "She is _____ tall.",
    opts: ["quite", "very", "too", "so"],
    ans: 1,
    exp: "quite = かなり。quite tall = かなり背が高い",
  },
  {
    q: "I have a _____ to the party.",
    opts: ["ticket", "pass", "invitation", "letter"],
    ans: 3,
    exp: "invitation = 招待状。to the party = パーティーへの",
  },
  {
    q: "The _____ is very spacious.",
    opts: ["house", "room", "apartment", "building"],
    ans: 1,
    exp: "spacious = 広い。house = 家",
  },
  {
    q: "He _____ his lunch at noon.",
    opts: ["eats", "ate", "eating", "have eaten"],
    ans: 1,
    exp: "eats = 食べる。at noon = 正午に（習慣）",
  },
  {
    q: "The _____ of the building is very high.",
    opts: ["height", "size", "length", "width"],
    ans: 1,
    exp: "height = 高さ。building = 建物",
  },
  {
    q: "I _____ coffee every morning.",
    opts: ["drink", "drinking", "drank", "have drunk"],
    ans: 1,
    exp: "drink = 飲む。every morning = 毎朝（習慣）",
  },
  {
    q: "She _____ the piano very well.",
    opts: ["plays", "play", "played", "playing"],
    ans: 1,
    exp: "plays = 弾く。piano = ピアノ",
  },
  {
    q: "The _____ of the story is interesting.",
    opts: ["end", "beginning", "middle", "plot"],
    ans: 4,
    exp: "plot = ストーリー。story = 物語",
  },
  {
    q: "I am _____ in mathematics.",
    opts: ["interested", "interesting", "good", "bad"],
    ans: 1,
    exp: "interested in = ~に興味がある",
  },
  {
    q: "The _____ is fresh.",
    opts: ["bread", "milk", "butter", "cheese"],
    ans: 1,
    exp: "bread = パン。fresh = 新鮮な",
  },
  {
    q: "He _____ at the hospital.",
    opts: ["works", "work", "working", "worked"],
    ans: 1,
    exp: "works = 働く。hospital = 病院",
  },
  {
    q: "The _____ is very clean.",
    opts: ["floor", "wall", "ceiling", "door"],
    ans: 1,
    exp: "floor = 床。clean = きれいな",
  },
  {
    q: "I _____ to music while studying.",
    opts: ["listen", "hear", "sound", "music"],
    ans: 1,
    exp: "listen to = ~を聴く。music = 音楽",
  },
  {
    q: "She _____ a beautiful voice.",
    opts: ["has", "have", "having", "had"],
    ans: 1,
    exp: "has = 持っている。voice = 声",
  },
  {
    q: "The _____ is very fast.",
    opts: ["car", "bus", "train", "airplane"],
    ans: 4,
    exp: "fast = 速い。airplane = 飛行機",
  },
  {
    q: "I _____ my umbrella at school.",
    opts: ["forgot", "left", "lost", "kept"],
    ans: 2,
    exp: "left = 置き忘れた。at school = 学校に",
  },
  {
    q: "The _____ is very deep.",
    opts: ["river", "lake", "ocean", "sea"],
    ans: 3,
    exp: "ocean = 海。deep = 深い",
  },
  {
    q: "He _____ a doctor.",
    opts: ["is", "are", "am", "be"],
    ans: 1,
    exp: "is = です。He is a doctor = 彼は医者です",
  },
  {
    q: "I _____ the exam yesterday.",
    opts: ["passed", "failed", "took", "won"],
    ans: 1,
    exp: "passed = 合格した。exam = 試験",
  },
  {
    q: "The _____ is very crowded.",
    opts: ["station", "store", "museum", "library"],
    ans: 1,
    exp: "crowded = 混雑している。station = 駅",
  },
  {
    q: "She _____ her mother very much.",
    opts: ["loves", "like", "liked", "loving"],
    ans: 1,
    exp: "loves = 愛している。mother = 母",
  },
  {
    q: "The _____ is very delicious.",
    opts: ["cake", "candy", "chocolate", "cookie"],
    ans: 1,
    exp: "cake = ケーキ。delicious = おいしい",
  },
  {
    q: "I _____ swimming.",
    opts: ["like", "likes", "liked", "liking"],
    ans: 1,
    exp: "like = 好きだ。swimming = 泳ぐこと",
  },
  {
    q: "The _____ is very big.",
    opts: ["zoo", "park", "school", "office"],
    ans: 1,
    exp: "zoo = 動物園。big = 大きい",
  },
  {
    q: "He _____ to me every day.",
    opts: ["talks", "talk", "talked", "talking"],
    ans: 1,
    exp: "talks = 話す。every day = 毎日",
  },
  {
    q: "The _____ are very fresh.",
    opts: ["vegetables", "fruits", "meat", "fish"],
    ans: 1,
    exp: "vegetables = 野菜。fresh = 新鮮な",
  },
  {
    q: "I _____ breakfast at 7 AM.",
    opts: ["eat", "eating", "ate", "have eaten"],
    ans: 1,
    exp: "eat = 食べる。breakfast = 朝食",
  },
  {
    q: "She _____ in the city.",
    opts: ["lives", "live", "lived", "living"],
    ans: 1,
    exp: "lives = 住んでいる。city = 都市",
  },
  {
    q: "The _____ is warm.",
    opts: ["jacket", "coat", "sweater", "shirt"],
    ans: 2,
    exp: "coat = コート。warm = 暖かい",
  },
  {
    q: "I _____ my friend last week.",
    opts: ["saw", "see", "seen", "seeing"],
    ans: 1,
    exp: "saw = 会った。last week = 先週（過去形）",
  },
  {
    q: "The _____ is very skilled.",
    opts: ["doctor", "teacher", "engineer", "artist"],
    ans: 1,
    exp: "doctor = 医者。skilled = 熟練した",
  },
  {
    q: "He _____ a book.",
    opts: ["reads", "read", "reading", "have read"],
    ans: 1,
    exp: "reads = 読む。book = 本",
  },
  {
    q: "The _____ is very loud.",
    opts: ["sound", "noise", "music", "voice"],
    ans: 2,
    exp: "noise = 騒音。loud = うるさい",
  },
  {
    q: "I _____ my teeth every morning.",
    opts: ["brush", "clean", "wash", "keep"],
    ans: 1,
    exp: "brush = ブラシで磨く。teeth = 歯",
  },
  {
    q: "She _____ a student.",
    opts: ["is", "are", "am", "be"],
    ans: 1,
    exp: "is = です。She is a student = 彼女は学生です",
  },
  {
    q: "The _____ are very beautiful.",
    opts: ["flowers", "trees", "plants", "grass"],
    ans: 1,
    exp: "flowers = 花。beautiful = 美しい",
  },
  {
    q: "I need a _____ for this job.",
    opts: ["help", "assistant", "person", "hand"],
    ans: 1,
    exp: "help = 手助け。need = 必要とする",
  },
  {
    q: "The _____ is very soft.",
    opts: ["pillow", "bed", "chair", "table"],
    ans: 1,
    exp: "pillow = 枕。soft = 柔らかい",
  },
  {
    q: "He _____ his clothes every week.",
    opts: ["washes", "wash", "washed", "washing"],
    ans: 1,
    exp: "washes = 洗う。every week = 毎週（習慣）",
  },
  {
    q: "The _____ are very colorful.",
    opts: ["birds", "insects", "animals", "fish"],
    ans: 1,
    exp: "birds = 鳥。colorful = 色彩豊か",
  },
  {
    q: "I have a _____ for tomorrow.",
    opts: ["plan", "meeting", "appointment", "event"],
    ans: 1,
    exp: "plan = 計画。tomorrow = 明日",
  },
  {
    q: "The _____ are very expensive.",
    opts: ["shoes", "clothes", "books", "toys"],
    ans: 1,
    exp: "shoes = 靴。expensive = 高い",
  },
  {
    q: "She _____ every morning.",
    opts: ["exercises", "exercise", "exercising", "exercised"],
    ans: 1,
    exp: "exercises = 運動する。every morning = 毎朝（習慣）",
  },
  {
    q: "The _____ is very interesting.",
    opts: ["article", "story", "book", "movie"],
    ans: 1,
    exp: "article = 記事。interesting = 興味深い",
  },
  {
    q: "I _____ a letter to my friend.",
    opts: ["wrote", "write", "writing", "have written"],
    ans: 1,
    exp: "wrote = 書いた。letter = 手紙（過去形）",
  },
  {
    q: "The _____ are very sharp.",
    opts: ["knives", "scissors", "pencils", "pens"],
    ans: 1,
    exp: "knives = ナイフ。sharp = 鋭い",
  },
  {
    q: "He _____ in the gym every day.",
    opts: ["trains", "train", "training", "trained"],
    ans: 1,
    exp: "trains = 訓練する。gym = ジム（習慣）",
  },
  {
    q: "The _____ is very warm.",
    opts: ["blanket", "sheet", "pillow", "mattress"],
    ans: 1,
    exp: "blanket = 毛布。warm = 暖かい",
  },
  {
    q: "I _____ three languages.",
    opts: ["speak", "speaks", "speaking", "spoke"],
    ans: 1,
    exp: "speak = 話す。languages = 言語",
  },
  {
    q: "The _____ are very fresh.",
    opts: ["apples", "oranges", "bananas", "grapes"],
    ans: 1,
    exp: "apples = りんご。fresh = 新鮮な",
  },
  {
    q: "She _____ to the university.",
    opts: ["went", "go", "going", "have gone"],
    ans: 1,
    exp: "went = 行った。university = 大学（過去形）",
  },
  {
    q: "The _____ is very dark.",
    opts: ["room", "house", "building", "cave"],
    ans: 1,
    exp: "room = 部屋。dark = 暗い",
  },
  {
    q: "I _____ my room every weekend.",
    opts: ["clean", "cleans", "cleaning", "cleaned"],
    ans: 1,
    exp: "clean = 掃除する。every weekend = 毎週末（習慣）",
  },
  {
    q: "The _____ is very dangerous.",
    opts: ["knife", "gun", "bomb", "weapon"],
    ans: 1,
    exp: "knife = ナイフ。dangerous = 危険な",
  },
  {
    q: "He _____ in London.",
    opts: ["lives", "live", "lived", "living"],
    ans: 1,
    exp: "lives = 住んでいる。London = ロンドン",
  },
  {
    q: "The _____ is very large.",
    opts: ["stadium", "school", "church", "museum"],
    ans: 1,
    exp: "stadium = スタジアム。large = 大きい",
  },
  {
    q: "I _____ to play football.",
    opts: ["like", "likes", "liked", "liking"],
    ans: 1,
    exp: "like = 好きだ。football = フットボール",
  },
];

// 英検3級 文法問題テンプレート（100問分）
const grammarTemplates = [
  {
    q: "He has been _____ for three hours.",
    opts: ["working", "worked", "works", "work"],
    ans: 1,
    exp: "現在完了進行形。has been + -ing で継続中",
  },
  {
    q: "_____ he studies hard, he will pass the exam.",
    opts: ["If", "Unless", "Although", "Because"],
    ans: 1,
    exp: "If = もし。未来の条件を表す",
  },
  {
    q: "I don't know _____ he will come tomorrow.",
    opts: ["whether", "if", "what", "how"],
    ans: 1,
    exp: "whether = ~かどうか。don't know の後では whether",
  },
  {
    q: "She _____ coffee when I called her.",
    opts: ["was drinking", "drank", "has been drinking", "drinks"],
    ans: 1,
    exp: "過去進行形。when I called = その時に進行中",
  },
  {
    q: "He _____ never been to Japan.",
    opts: ["has", "have", "had", "is"],
    ans: 1,
    exp: "現在完了。has never been = 一度も行ったことない",
  },
  {
    q: "The book _____ by Shakespeare is famous.",
    opts: ["written", "writing", "wrote", "write"],
    ans: 1,
    exp: "過去分詞を形容詞的に使用。written by = 書かれた",
  },
  {
    q: "I _____ to London next month.",
    opts: ["am going", "go", "went", "will go"],
    ans: 1,
    exp: "近い未来。be going to = ~するつもりだ",
  },
  {
    q: "She can't help _____ about the accident.",
    opts: ["thinking", "think", "thought", "to think"],
    ans: 1,
    exp: "can't help + -ing = ~せずにはいられない",
  },
  {
    q: "The movie _____ two hours.",
    opts: ["lasted", "lasted for", "was lasted", "lasts"],
    ans: 1,
    exp: "last = 続く。lasted two hours = 2時間続いた",
  },
  {
    q: "Both of them _____ interested in music.",
    opts: ["are", "is", "were", "was"],
    ans: 1,
    exp: "both of them = 2人とも。複数形なので are",
  },
  {
    q: "_____ you speak English, you can get the job.",
    opts: ["If", "Although", "Unless", "Since"],
    ans: 4,
    exp: "Since = ~だから。理由を示す",
  },
  {
    q: "I think it's time you _____ home.",
    opts: ["go", "went", "goes", "should go"],
    ans: 2,
    exp: "It's time you did... = ~すべき時だ（仮定法過去）",
  },
  {
    q: "The higher you go, _____ oxygen there is.",
    opts: ["the less", "less", "the least", "the lesser"],
    ans: 1,
    exp: "The ...er, the ...er. 比較級の相関表現",
  },
  {
    q: "He _____ to be sick, but he was just pretending.",
    opts: ["pretended", "seemed", "appeared", "looked"],
    ans: 1,
    exp: "pretend to be = ~なふりをする",
  },
  {
    q: "She gave her friend a book, and he gave _____ one.",
    opts: ["her", "hers", "her a", "herself"],
    ans: 1,
    exp: "gave her one = 彼女に1冊あげた",
  },
  {
    q: "It is said that _____ than one million people visited.",
    opts: ["more", "more than", "most", "the most"],
    ans: 2,
    exp: "more than = ~以上。数量を比較",
  },
  {
    q: "Without _____, he wouldn't have succeeded.",
    opts: ["your help", "your helping", "help you", "you helping"],
    ans: 1,
    exp: "Without + 名詞 = ~がなければ",
  },
  {
    q: "The student _____ for this exam is John.",
    opts: ["studying", "who is studying", "studied", "who study"],
    ans: 2,
    exp: "関係詞。who is studying = 最も一生懸命勉強している学生",
  },
  {
    q: "By the time he arrives, dinner _____.",
    opts: ["will have been prepared", "will be prepared", "has been prepared", "is prepared"],
    ans: 1,
    exp: "未来完了。彼が到着するまでに準備されているだろう",
  },
  {
    q: "I would rather _____ at home than go out.",
    opts: ["stay", "stayed", "staying", "to stay"],
    ans: 1,
    exp: "would rather + 原形。~むしろ~したい",
  },
  {
    q: "The accident _____ have been avoided.",
    opts: ["could", "would", "might", "can"],
    ans: 1,
    exp: "could have been avoided = 避けられたはず",
  },
  {
    q: "He is accustomed _____ early in the morning.",
    opts: ["to waking up", "to wake up", "waking up", "for waking up"],
    ans: 1,
    exp: "be accustomed to + -ing = ~に慣れている",
  },
  {
    q: "I object _____ the plan.",
    opts: ["to", "for", "on", "in"],
    ans: 1,
    exp: "object to = ~に反対する",
  },
  {
    q: "The book is worth _____.",
    opts: ["reading", "read", "to read", "being read"],
    ans: 1,
    exp: "be worth + -ing = 読む価値がある",
  },
  {
    q: "She _____ that she hadn't known about it.",
    opts: ["said", "told me", "spoke", "mentioned"],
    ans: 1,
    exp: "said that = ~と言った。that節で文を続ける",
  },
  {
    q: "Not only _____ but also intelligent.",
    opts: ["he is rich", "is he rich", "he is", "rich is he"],
    ans: 2,
    exp: "Not only ~ but also... 倒置形",
  },
  {
    q: "The soldier was _____ for his bravery.",
    opts: ["rewarded", "rewarding", "reward", "to reward"],
    ans: 1,
    exp: "be rewarded for = ~で報われる（受動態）",
  },
  {
    q: "It took him three hours _____ the work.",
    opts: ["to finish", "finishing", "finish", "finished"],
    ans: 1,
    exp: "It took + 時間 + to 原形 = ~するのに時間がかかった",
  },
  {
    q: "_____ the weather, the game was cancelled.",
    opts: ["Because of", "In spite of", "Although", "In case of"],
    ans: 1,
    exp: "Because of + 名詞 = ~のために",
  },
  {
    q: "He is the man _____ owns the company.",
    opts: ["that", "who", "whom", "whose"],
    ans: 2,
    exp: "関係詞。who owns = 会社を所有している",
  },
  {
    q: "I'm looking forward _____ you.",
    opts: ["to seeing", "to see", "seeing", "for seeing"],
    ans: 1,
    exp: "look forward to + -ing = ~を楽しみにしている",
  },
  {
    q: "He _____ as a doctor for twenty years.",
    opts: ["has been working", "has worked", "works", "worked"],
    ans: 1,
    exp: "現在完了進行形。20年間働き続けている",
  },
  {
    q: "The package _____ to you tomorrow.",
    opts: ["will be sent", "will sent", "is sent", "was sent"],
    ans: 1,
    exp: "未来の受動態。will be sent = 送られるでしょう",
  },
  {
    q: "I have no objection _____ what you suggested.",
    opts: ["to", "for", "in", "on"],
    ans: 1,
    exp: "objection to = ~に対する異議",
  },
  {
    q: "The reason _____ he was late is unknown.",
    opts: ["why", "which", "that", "what"],
    ans: 1,
    exp: "関係副詞 why。reason why = 理由",
  },
  {
    q: "She speaks English _____ fluently as a native.",
    opts: ["as", "so", "too", "very"],
    ans: 1,
    exp: "as ... as = ~と同じくらい。as fluently as",
  },
  {
    q: "I would appreciate it _____ you called me back.",
    opts: ["if", "unless", "although", "since"],
    ans: 1,
    exp: "appreciate it if = もし~してくれたら感謝する",
  },
  {
    q: "Unless you study hard, you _____ fail.",
    opts: ["will", "would", "might", "can"],
    ans: 1,
    exp: "Unless = ~でなければ。will fail = 落ちるだろう",
  },
  {
    q: "The film _____ I watched last night was great.",
    opts: ["that", "which", "what", "when"],
    ans: 1,
    exp: "関係詞。that/which watched = 昨晩見た映画",
  },
  {
    q: "If I were you, I _____ that job.",
    opts: ["would take", "would have taken", "will take", "take"],
    ans: 1,
    exp: "仮定法過去。would take = 受け取るだろう",
  },
  {
    q: "I have been waiting _____ for two hours.",
    opts: ["here", "for", "since", "during"],
    ans: 1,
    exp: "have been waiting here = ここで2時間待っている",
  },
  {
    q: "She insisted _____ going there alone.",
    opts: ["on", "for", "in", "at"],
    ans: 1,
    exp: "insist on + -ing = ~することを主張する",
  },
  {
    q: "The children _____ to bed early.",
    opts: ["were sent", "were send", "are sent", "be sent"],
    ans: 1,
    exp: "受動態過去形。were sent = 寝かしつけられた",
  },
  {
    q: "He spoke _____ that everyone could understand.",
    opts: ["so clearly", "such clearly", "so clear", "such clear"],
    ans: 1,
    exp: "so + 副詞 = そんなに。clearly = はっきりと",
  },
  {
    q: "The box is _____ heavy for me to carry.",
    opts: ["too", "so", "very", "much"],
    ans: 1,
    exp: "too ... to = ~するには~すぎる",
  },
  {
    q: "I suggest _____ there again.",
    opts: ["going", "to go", "go", "goes"],
    ans: 1,
    exp: "suggest + -ing = ~することを提案する",
  },
  {
    q: "What time _____ you usually wake up?",
    opts: ["do", "does", "did", "are"],
    ans: 1,
    exp: "do you wake up = あなたは何時に起きますか（習慣）",
  },
  {
    q: "_____ I finish this work, I'll call you.",
    opts: ["As soon as", "Unless", "Although", "Since"],
    ans: 1,
    exp: "As soon as = ~するとすぐに",
  },
  {
    q: "The team _____ won the championship is celebrating.",
    opts: ["that", "which", "what", "who"],
    ans: 1,
    exp: "関係詞。that won = 優勝した",
  },
];

function createVocabularyQuestions(): QuestionSeed[] {
  return vocabularyTemplates.map((t, i) => ({
    book_name: "英検3級",
    category: "vocabulary" as const,
    chapter: "単語" as const,
    grade_level: i % 2 === 0 ? "中3" : "高1",
    question_text: t.q,
    choice_1: t.opts[0],
    choice_2: t.opts[1],
    choice_3: t.opts[2],
    choice_4: t.opts[3],
    correct_choice: t.ans,
    q_type: "choice" as const,
    subject: "en",
    explanation: t.exp,
  }));
}

function createGrammarQuestions(): QuestionSeed[] {
  return grammarTemplates.map((t, i) => ({
    book_name: "英検3級",
    category: "grammar" as const,
    chapter: "文法" as const,
    grade_level: i % 2 === 0 ? "中3" : "高1",
    question_text: t.q,
    choice_1: t.opts[0],
    choice_2: t.opts[1],
    choice_3: t.opts[2],
    choice_4: t.opts[3],
    correct_choice: t.ans,
    q_type: "choice" as const,
    subject: "en",
    explanation: t.exp,
  }));
}

async function seedQuestions() {
  try {
    const vocabQuestions = createVocabularyQuestions();
    const grammarQuestions = createGrammarQuestions();
    const allQuestions = [...vocabQuestions, ...grammarQuestions];

    console.log(
      `\n🚀 英検3級 問題投入開始\n目標: ${vocabQuestions.length} 単語 + ${grammarQuestions.length} 文法 = ${allQuestions.length}問`
    );

    const { error } = await supabase.from("questions").insert(allQuestions);

    if (error) {
      console.error("❌ エラー:", error);
      process.exit(1);
    }

    console.log(`\n✅ 投入完了！\n`);
    console.log(
      `📊 結果: ${vocabQuestions.length} + ${grammarQuestions.length} = ${allQuestions.length}問`
    );
    console.log(`📁 book_name: 英検3級`);
    console.log(`🏷️  category: vocabulary(${vocabQuestions.length}) + grammar(${grammarQuestions.length})`);
  } catch (err) {
    console.error("❌ 予期しないエラー:", err);
    process.exit(1);
  }
}

seedQuestions();
