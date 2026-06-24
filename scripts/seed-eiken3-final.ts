import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}
const supabase = createClient(supabaseUrl, supabaseKey);

const BOOK = "英検3級 単語";
const CATEGORY = "英検";

type Item = { q: string; opts: [string, string, string, string]; ans: number; exp: string };
type Chapter = { label: string; items: Item[] };

// 10章 × 10問 = 100問。英検3級（中学卒業程度）レベルの語彙・熟語。
const chapters: Chapter[] = [
  {
    label: "① 日常生活",
    items: [
      { q: "I usually ___ up at six in the morning.（私はたいてい朝6時に起きる）", opts: ["wake", "sleep", "stand", "close"], ans: 1, exp: "wake up=起きる。sleep=眠る、stand=立つ、close=閉じる。" },
      { q: "Don't forget to ___ your teeth before bed.（寝る前に歯を磨くのを忘れないで）", opts: ["wash", "brush", "clean", "cut"], ans: 2, exp: "brush one's teeth=歯を磨く。歯にはbrushを使う。" },
      { q: "She ___ her face every morning.（彼女は毎朝顔を洗う）", opts: ["brushes", "washes", "opens", "paints"], ans: 2, exp: "wash one's face=顔を洗う。brush=磨く（歯・髪）。" },
      { q: "I need to ___ my room because it is messy.（散らかっているので部屋を掃除する必要がある）", opts: ["clean", "dirty", "build", "buy"], ans: 1, exp: "clean=掃除する。messy=散らかった。" },
      { q: "What will you ___ to the party tonight?（今夜のパーティーに何を着ていくの）", opts: ["eat", "wear", "take", "see"], ans: 2, exp: "wear=着る・身につける。服装はwear。" },
      { q: "Please ___ the door when you leave.（出るときはドアに鍵をかけてください）", opts: ["open", "break", "lock", "push"], ans: 3, exp: "lock=鍵をかける。leave=出発する。" },
      { q: "I ___ a shower before going to bed.（寝る前にシャワーを浴びる）", opts: ["take", "give", "make", "do"], ans: 1, exp: "take a shower=シャワーを浴びる。決まった言い方。" },
      { q: "We ___ breakfast together every Sunday.（毎週日曜は一緒に朝食をとる）", opts: ["have", "go", "play", "read"], ans: 1, exp: "have breakfast=朝食をとる。have=食べる。" },
      { q: "Remember to ___ away the trash.（ゴミを捨てるのを忘れないで）", opts: ["throw", "keep", "save", "carry"], ans: 1, exp: "throw away=捨てる。trash=ゴミ。" },
      { q: "He ___ the dishes after dinner.（彼は夕食後に皿を洗う）", opts: ["washes", "wears", "drives", "writes"], ans: 1, exp: "wash the dishes=皿を洗う。" },
    ],
  },
  {
    label: "② 学校・勉強",
    items: [
      { q: "Math is my favorite ___ at school.（数学は学校で一番好きな科目だ）", opts: ["subject", "object", "lesson", "test"], ans: 1, exp: "subject=（学校の）科目。math=数学。" },
      { q: "I have a lot of ___ to do tonight.（今夜やるべき宿題がたくさんある）", opts: ["homework", "housework", "work", "job"], ans: 1, exp: "homework=宿題。housework=家事と混同しない。" },
      { q: "Open your ___ to page ten.（教科書の10ページを開きなさい）", opts: ["notebook", "textbook", "dictionary", "magazine"], ans: 2, exp: "textbook=教科書。page=ページ。" },
      { q: "Look up the word in a ___.（その単語を辞書で調べなさい）", opts: ["dictionary", "diary", "calendar", "ticket"], ans: 1, exp: "dictionary=辞書。look up=調べる。" },
      { q: "Tom is my ___; we are in the same class.（トムは同級生で、同じクラスだ）", opts: ["teacher", "classmate", "neighbor", "stranger"], ans: 2, exp: "classmate=同級生。same class=同じクラス。" },
      { q: "The teacher wrote the answer on the ___.（先生が黒板に答えを書いた）", opts: ["floor", "window", "blackboard", "door"], ans: 3, exp: "blackboard=黒板。" },
      { q: "I studied hard for the English ___.（英語のテストのために一生懸命勉強した）", opts: ["exam", "game", "party", "trip"], ans: 1, exp: "exam=試験（=test）。study for=〜のために勉強する。" },
      { q: "Our English ___ starts at nine o'clock.（英語の授業は9時に始まる）", opts: ["lesson", "subject", "report", "club"], ans: 1, exp: "lesson=授業。start=始まる。" },
      { q: "Students must wear a ___ at this school.（この学校では生徒は制服を着なければならない）", opts: ["costume", "uniform", "jacket", "suit"], ans: 2, exp: "uniform=制服。must=〜しなければならない。" },
      { q: "She got a high ___ on the math test.（彼女は数学のテストで高得点を取った）", opts: ["price", "score", "number", "level"], ans: 2, exp: "score=得点。price=値段と混同しない。" },
    ],
  },
  {
    label: "③ 食事・買い物",
    items: [
      { q: "This cake is really ___.（このケーキは本当においしい）", opts: ["delicious", "dangerous", "difficult", "boring"], ans: 1, exp: "delicious=とてもおいしい。" },
      { q: "We had dinner at a nice ___ last night.（昨夜すてきなレストランで夕食をとった）", opts: ["library", "restaurant", "station", "hospital"], ans: 2, exp: "restaurant=レストラン。have dinner=夕食をとる。" },
      { q: "Can I see the ___, please?（メニューを見せてもらえますか）", opts: ["menu", "ticket", "receipt", "map"], ans: 1, exp: "menu=メニュー。レストランで料理を選ぶ表。" },
      { q: "Are you ready to ___ your food?（料理を注文する準備はできましたか）", opts: ["order", "cook", "carry", "wash"], ans: 1, exp: "order=注文する。" },
      { q: "This bag is too ___; I can't buy it.（このかばんは高すぎて買えない）", opts: ["cheap", "expensive", "free", "light"], ans: 2, exp: "expensive=高価な。cheap=安いの反対。" },
      { q: "My mother buys food at the ___.（母はスーパーで食料品を買う）", opts: ["supermarket", "post office", "bank", "museum"], ans: 1, exp: "supermarket=スーパー。" },
      { q: "How much do I have to ___ for this?（これにいくら払えばいいですか）", opts: ["pay", "save", "lend", "spend"], ans: 1, exp: "pay=（お金を）払う。how much=いくら。" },
      { q: "The shop was full of ___ during the sale.（セール中、店は客でいっぱいだった）", opts: ["workers", "customers", "teachers", "drivers"], ans: 2, exp: "customer=客。sale=セール。" },
      { q: "These vegetables are very ___.（この野菜はとても新鮮だ）", opts: ["fresh", "old", "dry", "hot"], ans: 1, exp: "fresh=新鮮な。vegetables=野菜。" },
      { q: "She followed the ___ to make the soup.（彼女はレシピに従ってスープを作った）", opts: ["recipe", "receipt", "rule", "letter"], ans: 1, exp: "recipe=レシピ・調理法。receipt=領収書と混同しない。" },
    ],
  },
  {
    label: "④ 自然・天気",
    items: [
      { q: "How is the ___ today?（今日の天気はどうですか）", opts: ["weather", "whether", "season", "time"], ans: 1, exp: "weather=天気。whether（〜かどうか）と混同しない。" },
      { q: "It is ___ today, so we may have rain soon.（今日は曇りなので、すぐ雨が降るかも）", opts: ["sunny", "cloudy", "clear", "dry"], ans: 2, exp: "cloudy=曇った。" },
      { q: "A big ___ hit the island last summer.（昨夏、大きな台風が島を襲った）", opts: ["typhoon", "rainbow", "wind", "cloud"], ans: 1, exp: "typhoon=台風。hit=襲う。" },
      { q: "We climbed the ___ and saw a great view.（山に登ってすばらしい景色を見た）", opts: ["river", "mountain", "sea", "field"], ans: 2, exp: "mountain=山。climb=登る。" },
      { q: "Children were swimming in the ___.（子どもたちが川で泳いでいた）", opts: ["river", "road", "sky", "wall"], ans: 1, exp: "river=川。swim in=〜で泳ぐ。" },
      { q: "Spring is my favorite ___ of the year.（春は一年で一番好きな季節だ）", opts: ["weather", "season", "month", "week"], ans: 2, exp: "season=季節。spring=春。" },
      { q: "The ___ is very high in summer here.（ここは夏に気温がとても高い）", opts: ["temperature", "number", "height", "weight"], ans: 1, exp: "temperature=気温・温度。" },
      { q: "Many wild animals live in the ___.（多くの野生動物が森に住んでいる）", opts: ["desert", "forest", "city", "garden"], ans: 2, exp: "forest=森。wild animals=野生動物。" },
      { q: "A strong ___ shook the whole building.（強い地震が建物全体を揺らした）", opts: ["earthquake", "thunder", "snow", "fire"], ans: 1, exp: "earthquake=地震。shake=揺らす。" },
      { q: "We must protect the ___ for the future.（未来のために環境を守らねばならない）", opts: ["environment", "experiment", "entrance", "evening"], ans: 1, exp: "environment=環境。protect=守る。" },
    ],
  },
  {
    label: "⑤ 体・健康・気持ち",
    items: [
      { q: "I have a bad ___; my head really hurts.（ひどい頭痛がして、頭が本当に痛い）", opts: ["stomachache", "headache", "toothache", "cold"], ans: 2, exp: "headache=頭痛。head（頭）+ache（痛み）。" },
      { q: "Take this ___ and you will feel better.（この薬を飲めば良くなりますよ）", opts: ["medicine", "water", "food", "drink"], ans: 1, exp: "medicine=薬。take medicine=薬を飲む。" },
      { q: "I am very ___ after the long walk.（長い散歩のあとでとても疲れている）", opts: ["tired", "happy", "free", "ready"], ans: 1, exp: "tired=疲れた。" },
      { q: "She felt ___ before the speech.（彼女はスピーチの前に緊張していた）", opts: ["nervous", "lucky", "kind", "lazy"], ans: 1, exp: "nervous=緊張した。before the speech=スピーチ前。" },
      { q: "We were ___ to hear the good news.（その良い知らせを聞いて驚いた）", opts: ["bored", "surprised", "tired", "angry"], ans: 2, exp: "be surprised=驚く。good news=良い知らせ。" },
      { q: "Eating vegetables keeps you ___.（野菜を食べると健康でいられる）", opts: ["healthy", "wealthy", "hungry", "sleepy"], ans: 1, exp: "healthy=健康な。keep=保つ。" },
      { q: "He stayed home because he had a ___.（熱があったので彼は家にいた）", opts: ["fever", "favor", "feather", "flavor"], ans: 1, exp: "fever=熱。have a fever=熱がある。" },
      { q: "You look tired. You should ___.（疲れているね。休んだほうがいい）", opts: ["rest", "run", "study", "work"], ans: 1, exp: "rest=休む。should=〜すべき。" },
      { q: "She was ___ about her son's safety.（彼女は息子の安全を心配していた）", opts: ["worried", "excited", "pleased", "glad"], ans: 1, exp: "be worried about=〜を心配する。safety=安全。" },
      { q: "The kids were ___ about the school trip.（子どもたちは修学旅行にわくわくしていた）", opts: ["excited", "tired", "afraid", "sad"], ans: 1, exp: "be excited about=〜にわくわくする。" },
    ],
  },
  {
    label: "⑥ 仕事・職業",
    items: [
      { q: "My father is a ___ at the hospital.（父は病院の医者だ）", opts: ["teacher", "doctor", "driver", "farmer"], ans: 2, exp: "doctor=医者。hospital=病院。" },
      { q: "An ___ designs bridges and roads.（技術者は橋や道路を設計する）", opts: ["engineer", "actor", "artist", "officer"], ans: 1, exp: "engineer=技術者・エンジニア。design=設計する。" },
      { q: "She works for a big computer ___.（彼女は大きなコンピュータ会社で働いている）", opts: ["company", "country", "college", "concert"], ans: 1, exp: "company=会社。work for=〜に勤める。" },
      { q: "There is an important ___ this afternoon.（今日の午後、大事な会議がある）", opts: ["meeting", "morning", "machine", "message"], ans: 1, exp: "meeting=会議。important=重要な。" },
      { q: "He gets a good ___ at his new job.（彼は新しい仕事で良い給料をもらっている）", opts: ["salary", "ticket", "prize", "score"], ans: 1, exp: "salary=給料。" },
      { q: "She is always ___ with her work.（彼女はいつも仕事で忙しい）", opts: ["free", "busy", "ready", "lazy"], ans: 2, exp: "busy=忙しい。with one's work=仕事で。" },
      { q: "He left his bag at the ___.（彼はかばんを会社[事務所]に忘れた）", opts: ["office", "kitchen", "garden", "bridge"], ans: 1, exp: "office=事務所・会社。" },
      { q: "Please write a ___ about the project.（その企画について報告書を書いてください）", opts: ["report", "recipe", "ribbon", "result"], ans: 1, exp: "report=報告書。project=企画。" },
      { q: "She had a job ___ yesterday.（彼女は昨日、就職の面接を受けた）", opts: ["interview", "introduce", "interest", "internet"], ans: 1, exp: "interview=面接。job interview=就職面接。" },
      { q: "A ___ helps sick people get better.（看護師は病気の人が良くなるのを助ける）", opts: ["nurse", "cook", "pilot", "writer"], ans: 1, exp: "nurse=看護師。sick people=病気の人。" },
    ],
  },
  {
    label: "⑦ 旅行・交通",
    items: [
      { q: "We arrived at the ___ two hours before the flight.（フライトの2時間前に空港に着いた）", opts: ["station", "airport", "harbor", "garage"], ans: 2, exp: "airport=空港。flight=フライト。" },
      { q: "Don't forget to buy a train ___.（電車の切符を買い忘れないで）", opts: ["ticket", "kitchen", "chicken", "pocket"], ans: 1, exp: "ticket=切符。" },
      { q: "Change trains at the next ___.（次の駅で電車を乗り換えてください）", opts: ["station", "stadium", "statue", "store"], ans: 1, exp: "station=駅。change trains=乗り換える。" },
      { q: "Every ___ on the bus had a seat.（バスのすべての乗客が席に座れた）", opts: ["passenger", "teacher", "worker", "writer"], ans: 1, exp: "passenger=乗客。" },
      { q: "What time does the plane ___ in Tokyo?（飛行機は何時に東京に着きますか）", opts: ["leave", "arrive", "start", "stop"], ans: 2, exp: "arrive=到着する。arrive in＋場所。" },
      { q: "The train was 30 minutes late because of a ___.（遅延のせいで電車は30分遅れた）", opts: ["delay", "delight", "design", "demand"], ans: 1, exp: "delay=遅延。be late=遅れる。" },
      { q: "He carried his heavy ___ to the hotel.（彼は重い荷物をホテルまで運んだ）", opts: ["luggage", "language", "message", "village"], ans: 1, exp: "luggage=（旅行の）荷物。" },
      { q: "I made a ___ at the hotel for two nights.（ホテルに2泊の予約をした）", opts: ["reservation", "relation", "reaction", "direction"], ans: 1, exp: "reservation=予約。make a reservation=予約する。" },
      { q: "She wants to study ___ next year.（彼女は来年、海外で勉強したい）", opts: ["aboard", "abroad", "around", "above"], ans: 2, exp: "abroad=海外で。aboard（乗って）と混同しない。" },
      { q: "Kyoto is a great place for ___.（京都は観光に最適な場所だ）", opts: ["shopping", "sightseeing", "swimming", "skating"], ans: 2, exp: "sightseeing=観光。" },
    ],
  },
  {
    label: "⑧ 形容詞",
    items: [
      { q: "He is a ___ singer known all over the world.（彼は世界中で知られる有名な歌手だ）", opts: ["famous", "nervous", "serious", "curious"], ans: 1, exp: "famous=有名な。known=知られている。" },
      { q: "Swimming in this river is ___.（この川で泳ぐのは危険だ）", opts: ["careful", "dangerous", "peaceful", "useful"], ans: 2, exp: "dangerous=危険な。" },
      { q: "It is ___ to sleep well before a test.（試験前によく眠ることは大切だ）", opts: ["important", "impossible", "interesting", "international"], ans: 1, exp: "important=重要な。It is ... to do構文。" },
      { q: "This question is too ___ for me.（この問題は私には難しすぎる）", opts: ["easy", "difficult", "simple", "clear"], ans: 2, exp: "difficult=難しい。too ...=〜すぎる。" },
      { q: "This sofa is very ___ to sit on.（このソファは座り心地がとても良い）", opts: ["comfortable", "terrible", "horrible", "valuable"], ans: 1, exp: "comfortable=快適な・心地よい。" },
      { q: "These two pictures look very ___.（この2枚の絵はとてもよく似ている）", opts: ["different", "similar", "special", "strange"], ans: 2, exp: "similar=似ている。different（違う）の反対。" },
      { q: "Please be ___ in the library.（図書館では静かにしてください）", opts: ["quiet", "quick", "quite", "quiz"], ans: 1, exp: "quiet=静かな。quite（かなり）と混同しない。" },
      { q: "This station is very ___ for shopping.（この駅は買い物にとても便利だ）", opts: ["convenient", "common", "correct", "central"], ans: 1, exp: "convenient=便利な。" },
      { q: "Water is ___ for all living things.（水はすべての生き物に必要だ）", opts: ["necessary", "natural", "national", "nervous"], ans: 1, exp: "necessary=必要な。living things=生き物。" },
      { q: "This dictionary is very ___ for students.（この辞書は学生にとても役立つ）", opts: ["useful", "useless", "careful", "colorful"], ans: 1, exp: "useful=役立つ。useless（役に立たない）の反対。" },
    ],
  },
  {
    label: "⑨ 動詞",
    items: [
      { q: "May I ___ your pen for a minute?（少しペンを借りてもいいですか）", opts: ["lend", "borrow", "bring", "buy"], ans: 2, exp: "borrow=借りる。lend（貸す）と区別。" },
      { q: "They ___ me to their birthday party.（彼らは私を誕生日会に招待した）", opts: ["invited", "visited", "joined", "entered"], ans: 1, exp: "invite=招待する。invite A to B。" },
      { q: "Let me ___ my friend to you.（友達をあなたに紹介させてください）", opts: ["introduce", "produce", "reduce", "improve"], ans: 1, exp: "introduce=紹介する。introduce A to B。" },
      { q: "Have you ___ which college to enter?（どの大学に入るか決めましたか）", opts: ["decided", "divided", "described", "delivered"], ans: 1, exp: "decide=決める。decide which to do。" },
      { q: "Practice every day to ___ your English.（毎日練習して英語を上達させなさい）", opts: ["improve", "approve", "remove", "prove"], ans: 1, exp: "improve=上達させる・改善する。" },
      { q: "Please ___ reading until I come back.（私が戻るまで読み続けてください）", opts: ["continue", "stop", "finish", "forget"], ans: 1, exp: "continue=続ける。until=〜まで。" },
      { q: "Can you ___ how to use this machine?（この機械の使い方を説明できますか）", opts: ["explain", "complain", "contain", "remain"], ans: 1, exp: "explain=説明する。how to use=使い方。" },
      { q: "I didn't ___ that it was already noon.（もう正午だと気づかなかった）", opts: ["realize", "recycle", "remember", "receive"], ans: 1, exp: "realize=気づく。already=すでに。" },
      { q: "She is ___ dinner for the guests.（彼女は客のために夕食を準備している）", opts: ["preparing", "repairing", "comparing", "appearing"], ans: 1, exp: "prepare=準備する。prepare dinner=夕食を準備する。" },
      { q: "You can ___ any color you like.（好きな色を選んでいいですよ）", opts: ["choose", "lose", "close", "cause"], ans: 1, exp: "choose=選ぶ。" },
    ],
  },
  {
    label: "⑩ 熟語（3級頻出）",
    items: [
      { q: "I'm ___ forward to seeing you again.（また会えるのを楽しみにしています）", opts: ["looking", "taking", "getting", "putting"], ans: 1, exp: "look forward to ...=〜を楽しみにする。to の後は名詞・-ing。" },
      { q: "She is good ___ playing the piano.（彼女はピアノを弾くのが得意だ）", opts: ["at", "in", "on", "to"], ans: 1, exp: "be good at ...=〜が得意。" },
      { q: "Please take ___ of my dog while I'm away.（留守の間、犬の世話をしてください）", opts: ["care", "part", "place", "time"], ans: 1, exp: "take care of ...=〜の世話をする。" },
      { q: "Don't give ___ even if it is hard.（つらくてもあきらめないで）", opts: ["up", "in", "out", "off"], ans: 1, exp: "give up=あきらめる。" },
      { q: "I am looking ___ my lost key.（なくした鍵を探している）", opts: ["for", "at", "after", "into"], ans: 1, exp: "look for ...=〜を探す。" },
      { q: "I ___ part in the speech contest.（私はスピーチコンテストに参加した）", opts: ["took", "made", "did", "got"], ans: 1, exp: "take part in ...=〜に参加する。" },
      { q: "I agree ___ you about this plan.（この計画についてあなたに賛成だ）", opts: ["with", "on", "to", "for"], ans: 1, exp: "agree with＋人=（人）に賛成する。" },
      { q: "She is proud ___ her son.（彼女は息子を誇りに思っている）", opts: ["of", "in", "at", "with"], ans: 1, exp: "be proud of ...=〜を誇りに思う。" },
      { q: "Our plans ___ on the weather.（私たちの計画は天気しだいだ）", opts: ["depend", "spend", "stand", "attend"], ans: 1, exp: "depend on ...=〜しだいである・に頼る。" },
      { q: "He grew ___ in a small town.（彼は小さな町で育った）", opts: ["up", "out", "on", "off"], ans: 1, exp: "grow up=育つ・成長する。" },
    ],
  },
];

type Row = Record<string, unknown>;

function buildRows(): Row[] {
  const rows: Row[] = [];
  for (const ch of chapters) {
    const chapterName = `${BOOK} ${ch.label}`;
    for (const it of ch.items) {
      rows.push({
        book_name: BOOK,
        category: CATEGORY,
        chapter: chapterName,
        grade_level: chapterName, // 既存（準2級）に合わせ chapter と同値
        question_text: it.q,
        choice_1: it.opts[0],
        choice_2: it.opts[1],
        choice_3: it.opts[2],
        choice_4: it.opts[3],
        correct_choice: it.ans,
        option_1: it.opts[0],
        option_2: it.opts[1],
        option_3: it.opts[2],
        option_4: it.opts[3],
        correct_option: it.ans,
        q_type: "choice",
        correct_text: null,
        subject: "en",
        explanation: it.exp,
      });
    }
  }
  return rows;
}

async function seed() {
  const rows = buildRows();
  console.log(`🚀 投入開始: ${BOOK}（${CATEGORY}）`);
  console.log(`   ${chapters.length}章 × 10問 = ${rows.length}問`);

  if (rows.length !== 100) {
    console.error(`❌ 問題数が100でない: ${rows.length}`);
    process.exit(1);
  }

  const { error } = await supabase.from("questions").insert(rows);
  if (error) {
    console.error("❌ エラー:", error);
    process.exit(1);
  }

  console.log(`\n✅ 投入完了！ ${rows.length}問`);
  chapters.forEach((c) =>
    console.log(`   ├─ ${BOOK} ${c.label} … ${c.items.length}問`)
  );
}

seed();
