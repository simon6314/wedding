// 婚宴設定：之後把名字、日期、賓客名單換成真的就好
// guests 目前是假資料（自動產生）；要換成真名單時，照下面格式填進 GUESTS 陣列即可：
//   一筆 = 一份報名（一家人填一次就好）
//   { name: '王小明', table: 3, g: 'm', count: 4, kids: 2 }
//     name  填表的人（代表）        table 桌號
//     g     代表的性別 'm' 男 / 'f' 女
//     count 這一家總共幾位（含代表，不填就是 1 位）
//     kids  其中幾位是小朋友（不填就是 0）
//     lap   小朋友裡有幾位不佔座位（坐大人腿上）；baby: true 表示是嬰兒（畫得更小）；highchair: true 表示坐兒童座椅
//     note  身分備註，例如 '主持人'、'婚禮歌手'
//     look  外型，例如 { hair: '#1f1b1d', skin: '#dba47c', hs: 'bob' }（hs 髮型：long/bob/pony/bun/short/side）
//     age   年齡層（換造型圖用）：'mid' 中年、'young' 年輕、'teen' 國中、'toddler' 幼兒；不填會照名字猜
//     img   用圖片當人物，例如 img: 'img/xxx.png', ratio: 寬 / 高
//     members 家人的性別和外型，例如 [{ g: 'f', look: { hs: 'bob' } }]
//   畫面上會出現 count 個人：代表本人＋「王小明的家人」，同一家坐在一起，
//   點桌子會顯示「王小明（一家 4 位）」，搜尋王小明會把一家人一起標出來。
window.WEDDING = {
  title: '我們的婚禮派對',
  groom: '思宏',
  bride: '瀅安',
  date: '2026.11.29',       // 115 年 11 月 29 日 午宴
  venue: 'Honeywood 美式饗宴',
  // 主桌：新郎新娘＋雙方主婚人（名字可改）
  vip: [
    { id: 'groom', name: '思宏（新郎）', role: 'groom', img: 'img/groom_v2.png', ratio: 241 / 512 },   // Gemini 生成的圖
    { id: 'bride', name: '瀅安（新娘）', role: 'bride', img: 'img/bride_v2.png', ratio: 340 / 512 },
    { id: 'gdad', name: '民星（男方主婚人）', role: 'dad', side: 'g', img: 'img/gdad.png', ratio: 226 / 512 },
    { id: 'gmom', name: '月娥（男方主婚人）', role: 'mom', side: 'g', img: 'img/gmom.png', ratio: 255 / 512 },
    { id: 'bdad', name: '定震（女方主婚人）', role: 'dad', side: 'b', img: 'img/bdad.png', ratio: 226 / 512 },
    { id: 'bmom', name: '玉華（女方主婚人）', role: 'mom', side: 'b', img: 'img/bmom_v2.png', ratio: 272 / 512 },
  ],
  // 真名單放這裡；留 null 就會用假資料
  GUESTS: [
    // 第 2 桌
    { name: '姵汝', table: 2, g: 'f', img: 'img/yuru.png', ratio: 295 / 512 },   // 新圖（去除白底）
    { name: '鈺庭', table: 2, g: 'm', count: 3, kids: 1, lap: 1, baby: true, members: [{ g: 'f' }, { g: 'f' }] },   // 鈺庭（男）＋家人（女）＋未滿一歲的女兒
    { name: '明兌', table: 2, g: 'f', count: 2, kids: 1, img: 'img/mingdui.png', ratio: 272 / 512, lap: 1, highchair: true, members: [{ g: 'f' }] },   // 一位成人＋女兒（坐兒童座椅，不佔一般座位）
    { name: '閤祈', table: 2, g: 'f', count: 3, img: 'img/heqi.png', ratio: 288 / 512, kids: 1, lap: 1, highchair: true, members: [{ g: 'm' }, { g: 'f' }] },   // 一家三位：閤祈＋先生＋女兒（女兒坐兒童座椅，不佔一般座位）
    // 第 3 桌
    { name: '麗珠', table: 3, g: 'f', img: 'img/lizhu.png', ratio: 283 / 512 },
    { name: '品劭', table: 3, g: 'f', img: 'img/pinshao.png', ratio: 283 / 512 },
    { name: '芸岑', table: 3, g: 'f', count: 2, members: [{ g: 'f', rel: '朋友' }], img: 'img/yunqin_v2.png', ratio: 286 / 512 },   // 新圖（去除白底）；朋友（女）同行，稱呼為「朋友」
    { name: '菁莓', table: 3, g: 'f', img: 'img/jingmei.png', ratio: 251 / 512 },
    { name: '嘉真', table: 3, g: 'f', img: 'img/jiazhen.png', ratio: 287 / 512 },
    // 第 4 桌
    { name: '建智', table: 4, g: 'm', count: 2, note: '主持人', img: 'img/jianzhi.png', ratio: 225 / 512, members: [{ g: 'f', age: 'young' }] },   // 主持人；家人：年輕女性
    { name: 'Glenn', table: 4, g: 'm', count: 2, lang: 'en', img: 'img/guest/glenn.png', ratio: 230 / 512 },   // 只會英文；菲律賓人造型（Gemini）
    { name: '寶桂', table: 4, g: 'f', count: 2, img: 'img/baogui.png', ratio: 283 / 512 },
    // 第 5 桌
    { name: '宜妏', table: 5, g: 'f', count: 1 },
    { name: '宗城', table: 5, g: 'm', count: 1 },
    { name: '靜芬', table: 5, g: 'f', count: 1, img: 'img/yixun_wife.png', ratio: 288 / 512 },
    { name: '可欣', table: 5, g: 'f', count: 1 },
    { name: '皓宇', table: 5, g: 'm', count: 1 },
    { name: '新娘大姨', table: 5, g: 'f' },
    // 第 6 桌
    { name: '宜秀', table: 6, g: 'f', img: 'img/yixiu_v2.png', ratio: 309 / 512 },   // 新圖（去除白底）
    { name: '淑鈴', table: 6, g: 'f', img: 'img/shuling.png', ratio: 240 / 512 },   // 新圖（去除白底）
    { name: '昱靜', table: 6, g: 'f', img: 'img/yujing.png', ratio: 251 / 512 },   // 新圖（去除白底）
    { name: '芃磬', table: 6, g: 'f', img: 'img/pengqing.png', ratio: 310 / 512 },   // 新圖（去除白底）
    { name: '瀅琦', table: 6, g: 'f', img: 'img/yanqi.png', ratio: 287 / 512 },
    { name: '士堯', table: 6, g: 'm' },
    // 第 7 桌
    { name: '宗益', table: 7, g: 'm', count: 1 },
    { name: '嬌仙', table: 7, g: 'f', count: 1 },
    { name: '家禾', table: 7, g: 'm', count: 1 },
    { name: '家鋐', table: 7, g: 'm', count: 1 },
    { name: '玫秀', table: 7, g: 'f', img: 'img/guest/silver_f.png', ratio: 267 / 512 },   // 銀白短髮造型（Gemini）
    { name: '玉智', table: 7, g: 'f' },
    { name: '小燕', table: 7, g: 'f' },
    { name: '莊', table: 7, g: 'f' },
    // 第 8 桌
    { name: '峻緯', table: 8, g: 'm', count: 3 },
    { name: '筠霏', table: 8, g: 'f', count: 2 },
    { name: '仲蔚', table: 8, g: 'm' },
    // 第 9 桌
    { name: '國隆', table: 9, g: 'm' },
    { name: '月嬌', table: 9, g: 'f' },
    { name: '新郎二舅媽', table: 9, g: 'f' },
    { name: '佳紋', table: 9, g: 'f', img: 'img/jiawen.png', ratio: 287 / 512 },
    { name: '明緯', table: 9, g: 'm' },
    // 第 10 桌
    { name: '逸凱', table: 10, g: 'm', count: 4, age: 'mid', members: [{ g: 'f', age: 'mid', img: 'img/yikai_wife.png', ratio: 304 / 512 }, { g: 'm', age: 'teen' }, { g: 'f', age: 'teen' }] },   // 家人：太太＋國中男生＋國中女生
    { name: '娸華', table: 10, g: 'f', count: 2, img: 'img/huahua.png', ratio: 283 / 512 },
    // 第 11 桌
    { name: '國慶', table: 11, g: 'm', count: 4, members: [{ g: 'f', img: 'img/guoqing_wife.png', ratio: 288 / 512 }, {}, {}] },
    { name: '月裡', table: 11, g: 'f', count: 2, img: 'img/guest/silver_f.png', ratio: 267 / 512 },   // 銀白短髮造型（Gemini）
    { name: '新郎阿嬤', table: 11, g: 'f', elder: true, img: 'img/grandma.png', ratio: 282 / 512 },   // Gemini 生成的圖
    { name: '國興', table: 11, g: 'm' },
    // 第 12 桌
    { name: '民政', table: 12, g: 'm', count: 4 },
    { name: '月鳳', table: 12, g: 'f', count: 5, kids: 1, lap: 1, highchair: true, members: [{}, {}, {}, { g: 'm', img: 'img/yueh_kid.png', ratio: 256 / 512 }] },     // 含一位男性幼兒（坐兒童座椅，不佔一般座位）
  ],
  // 桌子備註
  tableNotes: { 13: '預備桌' },
};
