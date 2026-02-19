import type { UnitIdListType } from "../clientCommons/scout";

interface GradeMaster {
  [grade: string]: {
    name: string;
    detailIndex: string[];
    details: {
      number: string;
      description: string;
      cert: boolean;
    }[];
  };
}

export const gradeMap: Record<UnitIdListType, GradeMaster> = {
  bvs: {
    beaver: {
      name: "ビーバースカウト",
      detailIndex: [],
      details: [],
    },
    bigbeaver: {
      name: "ビッグビーバー",
      detailIndex: [],
      details: [],
    },
  },
  cs: {
    rabbit: {
      name: "うさぎ",
      detailIndex: [],
      details: [],
    },
    deer: {
      name: "しか",
      detailIndex: [],
      details: [],
    },
    bear: {
      name: "くま",
      detailIndex: [],
      details: [],
    },
  },
  bs: {
    beginner: {
      name: "初級スカウト章",
      detailIndex: [
        "基本",
        "健康と発達",
        "スカウト技能",
        "善行",
        "信仰奨励",
        "班長会議",
      ],
      details: [
        {
          number: "1-1",
          description:
            "「ちかい」と「おきて」が言える。そのうえで隊長と話し合う。",
          cert: true,
        },
        {
          number: "1-2",
          description:
            "「スカウト章」、「モットー」、「スローガン」の意味を説明できる。",
          cert: false,
        },
        {
          number: "1-3",
          description: "日本の国旗の正しい様式を知り、集会で掲揚柱に掲揚する。",
          cert: false,
        },
        {
          number: "1-4",
          description: "「連盟歌」が歌える。",
          cert: false,
        },
        {
          number: "1-5",
          description: "スカウトサイン、敬礼、スカウトの握手ができる。",
          cert: false,
        },
        {
          number: "2-1",
          description: "体温と脈拍を正しく測ることができる。",
          cert: false,
        },
        {
          number: "3-1",
          description: "自分の体や身近にあるものを用いて簡単な計測を行う。",
          cert: false,
        },
        {
          number: "3-2",
          description:
            "集会で使う身ぶり信号（気をつけ、休め、すわれ、分かれと集合隊形の各種サイン）、笛の合図を覚える。",
          cert: false,
        },
        {
          number: "3-3",
          description:
            "次のロープ結びの使いみちを理解し、実際に使う。[[enter]]ア）本結び　イ）一重つぎ　ウ）ふた結び　エ）もやい結び　オ）８の字結び",
          cert: false,
        },
        {
          number: "4-1",
          description: "集会などで行う社会奉仕活動へ積極的に参加する。",
          cert: false,
        },
        {
          number: "4-2",
          description: "住んでいる地域の避難場所を説明できる。",
          cert: false,
        },
        {
          number: "5-1",
          description:
            "隊集会やキャンプ、ハイキング等で行うスカウツオウン・サービスに参加する。",
          cert: false,
        },
        {
          number: "6-1",
          description:
            "初級スカウトとして進級することを、班長会議で認めてもらう。",
          cert: false,
        },
      ],
    },
    second: {
      name: "二級スカウト章",
      detailIndex: [
        "基本",
        "健康と発達",
        "スカウト技能",
        "奉仕",
        "信仰奨励",
        "班長会議",
      ],
      details: [
        {
          number: "1-1",
          description:
            "「ちかい」と「おきて」について意味を説明でき、その実践に努力していることを隊長に認めてもらう。",
          cert: true,
        },
        {
          number: "1-2",
          description:
            "日本の国旗の意味、歴史、仕様を説明でき、班や隊の活動で国旗を正しく掲揚できる。",
          cert: false,
        },
        {
          number: "1-3",
          description: "外国旗およびその国のスカウト章を5か国以上見分ける。",
          cert: false,
        },
        {
          number: "2-1",
          description: "体温、脈拍と体調との関係について説明する。",
          cert: false,
        },
        {
          number: "2-2-1",
          description:
            "日常遭遇しやすい次のような場合の応急手当や対応を説明できる。ア）鼻血イ）目のちりウ）やけどエ）指の切り傷オ）立ちくらみカ）頭痛キ）蜂、ダニ、毛虫などの虫さされク）熱中症",
          cert: false,
        },
        {
          number: "2-2-2",
          description:
            "三角布で他の人の頭、手、ひざ、足に包帯を巻き、腕を吊る方法を実演する。",
          cert: false,
        },
        {
          number: "2-2-3",
          description: "隊または班の安全係を担当する。",
          cert: false,
        },
        {
          number: "3-1",
          description:
            "16方位と方位角の呼び方を覚え、コンパスで進路を発見する。【読図章課目?と共通】",
          cert: false,
        },
        {
          number: "3-2",
          description:
            "2万5千分の1地形図を用いて次のことをする。①図上に示された2つの地点の間の方位角、直線距離、標高差、道路に沿った歩行距離を読む。②真北と磁北の違いを説明する。③500m（または1㎞）ごとの方眼を正確に書き入れた地形図により、6桁（または8桁）座標読みを行い、示された地点に到達する。【読図章課目?と共通】",
          cert: false,
        },
        {
          number: "3-3",
          description: "10個以上の地形図記号を覚える。",
          cert: false,
        },
        {
          number: "3-4",
          description:
            "地図とコンパスを用いた10㎞程度のハイキングを計画し、隊長の指名する2級以上のスカウト（ただし、適任者がいない場合はベンチャースカウトも可）とともに、保護者の同意のもと実施し、報告する。このハイキングは、1.基本?および、6.班長会議?以外の課目を修了した後に、仕上げの課目として行う。",
          cert: true,
        },
        {
          number: "3-5",
          description:
            "ナイフ、なた、のこぎりを安全に使用でき、手入れと保管ができる。",
          cert: false,
        },
        {
          number: "3-6",
          description:
            "火口、焚き付け、薪を作り、マッチ2本で火を起こし、500mlの水を沸騰させる。",
          cert: false,
        },
        {
          number: "3-7",
          description:
            "次のロープ結びの使いみちを理解し、実際に使う。①巻き結び②ねじ結び③引きとけ結び④ちぢめ結び⑤腰掛け結び⑥てぐす結び⑦てこ結び⑧張り綱結び",
          cert: false,
        },
        {
          number: "3-8",
          description:
            "24個の小さな物を1分間観察し、そのうちの16個以上を記憶によって答える。【観察章課目?と共通】",
          cert: false,
        },
        {
          number: "3-9",
          description:
            "100mの距離を誤差5%以内で歩測する。【計測章課目?と共通】",
          cert: false,
        },
        {
          number: "3-10",
          description:
            "スカウトペースで2㎞を15分で移動する。【計測章課目?と共通】",
          cert: false,
        },
        {
          number: "3-11",
          description:
            "片かな手旗信号で15の原画を理解し、10文字程度の語句を発信、受信できる。",
          cert: false,
        },
        {
          number: "3-12",
          description:
            "自宅および活動場所から近隣の避難場所を探し、ルートを示すこと。",
          cert: false,
        },
        {
          number: "4-1",
          description:
            "デンコーチとして3か月以上の奉仕、または社会奉仕活動を3回以上実施する。",
          cert: false,
        },
        {
          number: "5-1",
          description:
            "スカウツオウン・サービスで、自分ができる役割を果たし、「ちかい」と「おきて」を日常で実践したこと、感じたことを発表する。【信仰奨励章?と共通】",
          cert: false,
        },
        {
          number: "6-1",
          description:
            "初級スカウトとして3か月以上、隊および班活動に進んで参加したことを班長会議で認めてもらう。",
          cert: false,
        },
      ],
    },
    first: {
      name: "一級スカウト章",
      detailIndex: [
        "基本",
        "健康と発達",
        "スカウト技能",
        "奉仕",
        "信仰奨励",
        "班長会議",
      ],
      details: [
        {
          number: "1-1",
          description:
            "「ちかい」と「おきて」の実践に努力していることを日常の生活で示す。",
          cert: true,
        },
        {
          number: "1-2",
          description:
            "姉妹都市または自分が興味をもっている2か国の民族、文化、通貨、言語を調べ、隊または班集会で話す。",
          cert: false,
        },
        {
          number: "1-1",
          description:
            "日本の国旗と外国旗を併用して掲揚および設置する時の注意事項を知る。",
          cert: false,
        },
        {
          number: "1-2",
          description: "半旗の意味と正しい掲揚の方法を知る。",
          cert: false,
        },
        {
          number: "2-1",
          description:
            "50m泳ぐか1000mを走り、自己記録を更新できるように努力する。",
          cert: false,
        },
        {
          number: "2-2",
          description:
            "水分や食物の補給が体調に与える影響を知り、体調を管理するための準備ができる。",
          cert: false,
        },
        {
          number: "2-3-1",
          description: "班員1人と協力して、急造担架を作り、実際に人を運ぶ。",
          cert: false,
        },
        {
          number: "2-3-2",
          description:
            "直接圧迫止血法と間接圧迫止血法の違いを知り、直接圧迫止血法による急処置ができる。",
          cert: false,
        },
        {
          number: "3-1",
          description: "班の炊事係として、キャンプの調理を担当する。",
          cert: false,
        },
        {
          number: "3-2",
          description:
            "自然物（石、木、竹等）を用いた、キャンプに役立つ工作を1つ以上作成する。",
          cert: false,
        },
        {
          number: "3-3",
          description:
            "キャンプにおける用便、ゴミ処理ならびに食料保管について、衛生上注意する点を知り、実践できる。",
          cert: false,
        },
        {
          number: "3-4",
          description:
            "次に示すキャンプ経験について、いずれかの条件を満たしている。[[enter]]①ボーイスカウト隊に上進してから、連続5泊以上の隊キャンプか自団の班・隊で参加できる地区、県連盟、日本連盟のキャンプ大会に参加している。[[enter]]②2級スカウト章を取得してから、通算6泊以上のキャンプ経験を有している。",
          cert: false,
        },
        {
          number: "3-5",
          description:
            "1級旅行（1泊24時間以上のハイキング）の計画書を作成し、必要な個人装備を携行して隊長の指名するベンチャースカウト（ただし適任者がいない場合は1級以上のスカウト）とともに、隊長より与えられた課題と方法によりキャンプを行い、報告する。このハイキングは1.基本?および6.班長会議?以外の課目を修了した後に、仕上げの課目として行う。",
          cert: true,
        },
        {
          number: "3-6",
          description:
            "次のロープ結びの使いみちを理解し、実際に使う。①垣根結び②よろい結び③馬つなぎ④からみ止め⑤バックスプライス⑥角しばり⑦はさみしばり⑧筋かいしばり",
          cert: false,
        },
        {
          number: "3-7",
          description:
            "北極星の発見方法を知り、北極星を発見できる。また、5つの星座を発見できる。【観察章課目?と共通】",
          cert: false,
        },
        {
          number: "3-8",
          description:
            "簡易測量法を用い、到達できない2点間の距離（長さ、高さ）を誤差10%以内で測る。【計測章課目?と共通】",
          cert: false,
        },
        {
          number: "3-9",
          description:
            "ハイキングで野帳をつけ、またその野帳によって略地図を作る。【ハイキング章課目?と共通】",
          cert: false,
        },
        {
          number: "3-10",
          description: "片かな手旗信号で20文字以上の文章を発信、受信できる",
          cert: false,
        },
        {
          number: "3-11",
          description:
            "号笛を使って野外でできる簡単な通信ゲームを考え実施するか、号笛を使用した救難信号を覚える。",
          cert: false,
        },
        {
          number: "3-12",
          description: "技能章から「読図章」を含む合計3個取得する。",
          cert: false,
        },
        {
          number: "4-1",
          description:
            "班での奉仕活動を計画し、隊長の承認を得て実施、報告する。",
          cert: true,
        },
        {
          number: "4-2",
          description: "地域や学校等の環境保全活動や避難訓練に参加する。",
          cert: false,
        },
        {
          number: "5-1",
          description:
            "隊集会やキャンプ、ハイキングで行うスカウツオウン・サービスで、主要な役割を果たす。【信仰奨励章?と共通】",
          cert: false,
        },
        {
          number: "6-1",
          description:
            "2級スカウトとして3か月以上、隊および班活動に進んで参加したことを班長会議で認めてもらう。",
          cert: false,
        },
      ],
    },
    mum: {
      name: "菊スカウト章",
      detailIndex: [
        "基本",
        "健康と発達",
        "スカウト技能",
        "奉仕",
        "信仰奨励",
        "班長会議",
      ],
      details: [
        {
          number: "1-1",
          description:
            "「ちかい」と「おきて」の実践に努力して、他のスカウトの模範となる。",
          cert: true,
        },
        {
          number: "1-2",
          description:
            "1級スカウト章を取得してから班長、次長、隊付、上級班長として隊運営に6か月以上携わる。",
          cert: false,
        },
        {
          number: "1-3",
          description:
            "B-Pのラストメッセージを読み、隊長とその内容について話しをする。",
          cert: true,
        },
        {
          number: "2-1",
          description:
            "自身の体力向上に向けて努力していることについて、隊長と話し合う。",
          cert: true,
        },
        {
          number: "2-2-1",
          description:
            "AED（自動体外式除細動器）について以下のことが説明できる。[[enter]]ア）AEDとは何か[[enter]]イ）どういう時に使用するか[[enter]]ウ）使用の手順",
          cert: false,
        },
        {
          number: "2-2-2",
          description: "たばこ・アルコール・薬物が人体に及ぼす害について知る",
          cert: false,
        },
        {
          number: "3-1",
          description:
            "技能章から「野営章」「野営炊事章」を含む合計6個取得する。",
          cert: false,
        },
        {
          number: "3-2",
          description:
            "地球環境問題について1つ取り上げ、自分には何ができるかを説明する。",
          cert: false,
        },
        {
          number: "3-3",
          description:
            "班キャンプの計画を立てて1泊以上の固定キャンプを実施し、隊長に報告書を提出する。",
          cert: true,
        },
        {
          number: "3-4",
          description:
            "自分の住む地域のハザードマップを入手し、他のスカウトや指導者にそこに記載されていることから何がわかり、どのような備えが必要かについて説明する。",
          cert: false,
        },
        {
          number: "4-1",
          description:
            "団や地域で取り組んでいる奉仕活動に4日以上（1日1時間以上）参加する。",
          cert: false,
        },
        {
          number: "5-1",
          description: "信仰奨励章を取得する。",
          cert: true,
        },
        {
          number: "6-1",
          description:
            "1級スカウトとして4か月以上、隊および班活動に進んで参加したことを班長会議で認めてもらう。",
          cert: false,
        },
      ],
    },
  },
  vs: {
    venture: {
      name: "ベンチャースカウト章",
      detailIndex: ["基本", "スカウト技能", "スカウト精神", "信仰"],
      details: [
        {
          number: "1-1",
          description:
            "日常生活において「ちかい」と「おきて」の実践に努め、自身の「日日の善行」について考えを隊集会で発表する。",
          cert: true,
        },
        {
          number: "2-1",
          description:
            "ベンチャースカウト隊の活動に参加し、その結果をふまえ次回集会の企画書を提出する。",
          cert: true,
        },
        {
          number: "2-2",
          description: "技能章から「読図章」、「公民章」を取得する。",
          cert: true,
        },
        {
          number: "3-1",
          description:
            "『スカウティング・フォア・ボーイズ』のキャンプファイア物語21、22および26を読み、内容について隊で話し合う。",
          cert: true,
        },
        {
          number: "4-1",
          description: "信仰奨励章を取得する。",
          cert: false,
        },
      ],
    },
    falcon: {
      name: "隼スカウト章",
      detailIndex: [
        "基本",
        "スカウト技能",
        "スカウト精神",
        "奉仕",
        "信仰奨励",
        "成長と貢献",
      ],
      details: [
        {
          number: "1-1",
          description:
            "ベンチャー章取得後、最低4か月間「ちかい」と「おきて」の実践に最善をつくし、隊集会で発表する。",
          cert: true,
        },
        {
          number: "2-1",
          description:
            "自ら課題を設定し、安全、衛生、環境に配慮した、2泊3日以上の移動キャンプを計画、実施、評価をまとめ報告する。",
          cert: true,
        },
        {
          number: "2-2",
          description: "技能章から「野営章」、「野外炊事章」を取得する。",
          cert: true,
        },
        {
          number: "2-3",
          description:
            "考査員認定の技能章から「救急章」を含む３個取得する（BS時に取得した考査員認定の技能章を含む）。",
          cert: true,
        },
        {
          number: "3-1",
          description:
            "地区や県の仲間や地域の仲間と、自分たちの活動や社会における課題をフォーラム形式で話し合い、将来につながる活動を実施する。",
          cert: true,
        },
        {
          number: "4-1",
          description:
            "隊や団、地域社会に貢献することを課題として企画、計画し、実績を隊長に提出する。",
          cert: true,
        },
        {
          number: "5-1",
          description:
            "自分が信仰する宗教もしくは自分の心に触れた教宗派の歴史と教えを知る。",
          cert: true,
        },
        {
          number: "6-1",
          description:
            "個人プロジェクトまたは、チームの主要な役割として、プロジェクトを計画、実施し、隊長に報告書を提出し、「隼プロジェクト」として団行事等で発表する。",
          cert: true,
        },
      ],
    },
    fuji: {
      name: "富士スカウト章",
      detailIndex: [
        "基本",
        "スカウト技能",
        "スカウト精神",
        "奉仕",
        "信仰奨励",
        "成長と貢献",
      ],
      details: [
        {
          number: "1-1",
          description:
            "隼スカウトとして、最低6か月間「ちかい」と「おきて」の実践に最善をつくし、地域や団行事などで発表する。",
          cert: true,
        },
        {
          number: "1-2",
          description:
            "現在の自分の考えと将来の進路についてまとめ、その内容を隊長と話し合う。",
          cert: true,
        },
        {
          number: "2-1",
          description:
            "自ら設定する課題により、２泊３日以上の固定または移動キャンプを計画し、実施後、評価を報告書にまとめ隊長へ提出する。",
          cert: true,
        },
        {
          number: "2-2",
          description:
            "考査員認定の技能章から「野営管理章」を含む合計６個以上取得する（BS時に取得した考査員認定の技能章を含む）。",
          cert: true,
        },
        {
          number: "3-1",
          description:
            "『スカウティング・フォア・ボーイズ』を読み、自身が今後の人生においてどのように社会に対して貢献できるかを隊長と話し合い感想文を提出する。",
          cert: true,
        },
        {
          number: "4-1",
          description:
            "地域社会や学校などでの奉仕活動を企画し、隊長の承認を得て実施、報告する",
          cert: true,
        },
        {
          number: "4-2",
          description:
            "地区、県連盟、日本連盟の行事等に奉仕し、その実績を報告する。",
          cert: true,
        },
        {
          number: "5-1",
          description:
            "宗教章を取得するか、取得に対して努力していることを隊長に認めてもらう。",
          cert: true,
        },
        {
          number: "6-1",
          description:
            "隼スカウトとして自己の成長と社会に役立つための課題を設定し、個人プロジェクト（研究、製作、実験など）を自ら企画して複数月の期間で実施し、完結させ隊長に報告書を提出し「富士プロジェクト」として地域や団行事で報告する。",
          cert: true,
        },
      ],
    },
  },
  rs: {},
} as const;
