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
    { id: 'bdad', name: '定震（女方主婚人）', role: 'dad', side: 'b', img: 'img/bdad_v2.png', ratio: 244 / 512 },
    { id: 'bmom', name: '玉華（女方主婚人）', role: 'mom', side: 'b', img: 'img/bmom_v2.png', ratio: 272 / 512 },
  ],
  // 真名單放這裡；留 null 就會用假資料
  GUESTS: [
    // 第 2 桌
    { name: '姵汝', table: 2, g: 'f', img: 'img/yuru.png', ratio: 295 / 512 },   // 新圖（去除白底）
    { name: '鈺庭', table: 2, g: 'm', count: 1, img: 'img/tingting.png', ratio: 251 / 512 },
    { name: '品萱', table: 2, g: 'f', count: 1, img: 'img/pinxuan_v2.png', ratio: 251 / 512 },
    { name: '筠甯', table: 2, g: 'f', count: 1, kid: true, baby: true, lap: 1 },   // 未滿一歲，坐在品萱腿上（膝上）
    { name: '明兌', table: 2, g: 'f', count: 1, img: 'img/mingdui.png', ratio: 272 / 512 },
    { name: '樂樂', table: 2, g: 'f', count: 1, kid: true, lap: 1, highchair: true },   // 小孩，坐兒童座椅在明兌旁邊
    { name: '閤祈', table: 2, g: 'f', count: 1, img: 'img/heqi.png', ratio: 288 / 512 },
    { name: '孟庭', table: 2, g: 'm', count: 1, img: 'img/mengting.png', ratio: 243 / 512 },
    { name: '羽涵', table: 2, g: 'f', count: 1, kid: true, lap: 1, highchair: true, img: 'img/yuhan.png', ratio: 364 / 512 },   // 幼童，坐幼童座椅在閤祈旁邊
    // 第 3 桌
    { name: '麗珠', table: 3, g: 'f', img: 'img/lizhu.png', ratio: 283 / 512 },
    { name: '品劭', table: 3, g: 'f', img: 'img/pinshao.png', ratio: 283 / 512 },
    { name: '芸岑', table: 3, g: 'f', count: 2, members: [{ g: 'f', rel: '朋友', img: 'img/yunqin_friend.png', ratio: 275 / 512 }], img: 'img/yunqin_v2.png', ratio: 286 / 512 },   // 新圖（去除白底）；朋友（女）同行，稱呼為「朋友」
    { name: '菁莓', table: 3, g: 'f', img: 'img/jingmei.png', ratio: 251 / 512 },
    { name: '嘉真', table: 3, g: 'f', img: 'img/jiazhen.png', ratio: 287 / 512 },
    // 第 4 桌
    { name: '建智', table: 4, g: 'm', count: 1, note: '主持人', img: 'img/jianzhi.png', ratio: 225 / 512 },   // 主持人
    { name: '舒婷', table: 4, g: 'f', count: 1, img: 'img/shuting.png', ratio: 283 / 512 },
    { name: 'Glenn', table: 4, g: 'm', count: 1, lang: 'en', img: 'img/guest/glenn.png', ratio: 230 / 512 },   // 只會英文；菲律賓人造型（Gemini）
    { name: '寶桂的家人', table: 4, g: 'm' },
    { name: '寶桂', table: 4, g: 'f', count: 1, img: 'img/baogui.png', ratio: 283 / 512 },
    { name: "Glenn's friend", table: 4, g: 'f' },
    // 第 5 桌
    { name: '宜妏', table: 5, g: 'f', count: 1, img: 'img/yixun_v2.png', ratio: 293 / 512 },
    { name: '宗城', table: 5, g: 'm', count: 1, img: 'img/zongcheng.png', ratio: 257 / 512 },
    { name: '靜芬', table: 5, g: 'f', count: 1, img: 'img/jingfen.png', ratio: 285 / 512 },
    { name: '可欣', table: 5, g: 'f', count: 1, img: 'img/kexin.png', ratio: 265 / 512 },
    { name: '皓宇', table: 5, g: 'm', count: 1, img: 'img/haoyu.png', ratio: 257 / 512 },
    { name: '新娘大姨', table: 5, g: 'f', img: 'img/dayi_v3.png', ratio: 281 / 512 },
    // 第 6 桌
    { name: '宜秀', table: 6, g: 'f', img: 'img/yixiu_v2.png', ratio: 309 / 512 },   // 新圖（去除白底）
    { name: '淑鈴', table: 6, g: 'f', img: 'img/shuling.png', ratio: 240 / 512 },   // 新圖（去除白底）
    { name: '昱靜', table: 6, g: 'f', img: 'img/yujing.png', ratio: 251 / 512 },   // 新圖（去除白底）
    { name: '芃磬', table: 6, g: 'f', img: 'img/pengqing.png', ratio: 310 / 512 },   // 新圖（去除白底）
    { name: '瀅琦', table: 6, g: 'f', img: 'img/yanqi.png', ratio: 287 / 512 },
    { name: '士堯', table: 6, g: 'm', img: 'img/shiyao.png', ratio: 252 / 512 },
    // 第 7 桌
    { name: '宗益', table: 7, g: 'm', count: 1, img: 'img/zongyi.png', ratio: 257 / 512 },
    { name: '嬌仙', table: 7, g: 'f', count: 1, img: 'img/jiaoxian.png', ratio: 291 / 512 },
    { name: '家禾', table: 7, g: 'm', count: 1, img: 'img/jiahe_v2.png', ratio: 247 / 512 },
    { name: '家鋐', table: 7, g: 'm', count: 1, img: 'img/jiahong.png', ratio: 245 / 512 },
    { name: '玫秀', table: 7, g: 'f', img: 'img/yixiu_mei_v3.png', ratio: 265 / 512 },   // 銀白短髮造型（Gemini）
    { name: '玉智', table: 7, g: 'f', img: 'img/yuzhi_v2.png', ratio: 282 / 512 },
    { name: '小燕', table: 7, g: 'f', img: 'img/xiaoyan_v4.png', ratio: 271 / 512 },
    { name: '莊', table: 7, g: 'f', img: 'img/zhuang_v2.png', ratio: 265 / 512 },
    // 第 8 桌
    { name: '峻緯', table: 8, g: 'm', count: 3, img: 'img/junwei.png', ratio: 244 / 512 },
    { name: '筠霏', table: 8, g: 'f', count: 2, img: 'img/yunfei.png', ratio: 264 / 512 },
    { name: '仲蔚', table: 8, g: 'm', img: 'img/zhongwei.png', ratio: 228 / 512 },
    // 第 9 桌
    { name: '國隆', table: 9, g: 'm' },
    { name: '月嬌', table: 9, g: 'f', img: 'img/yueh_aunt.png', ratio: 276 / 512 },
    { name: '新郎二舅媽', table: 9, g: 'f', img: 'img/xinlang_erjiumu.png', ratio: 257 / 512 },
    { name: '佳紋', table: 9, g: 'f', img: 'img/jiawen.png', ratio: 287 / 512 },
    { name: '明緯', table: 9, g: 'm' },
    // 第 10 桌
    { name: '逸凱', table: 10, g: 'm', count: 4, age: 'mid', members: [{ g: 'f', age: 'mid', img: 'img/yikai_wife.png', ratio: 304 / 512 }, { g: 'm', age: 'teen' }, { g: 'f', age: 'teen' }] },   // 家人：太太＋國中男生＋國中女生
    { name: '娸華', table: 10, g: 'f', count: 2, img: 'img/huahua.png', ratio: 283 / 512 },
    // 第 11 桌
    { name: '國慶', table: 11, g: 'm', count: 4, members: [{ g: 'f', img: 'img/guoqing_wife.png', ratio: 288 / 512 }, { g: 'f', img: 'img/guoqing_girl.png', ratio: 296 / 512 }, {}] },
    { name: '月裡', table: 11, g: 'f', count: 2, img: 'img/guest/silver_f.png', ratio: 267 / 512 },   // 銀白短髮造型（Gemini）
    { name: '新郎阿嬤', table: 11, g: 'f', elder: true, img: 'img/grandma.png', ratio: 282 / 512 },   // Gemini 生成的圖
    { name: '國興', table: 11, g: 'm' },
    // 第 12 桌
    { name: '民政', table: 12, g: 'm', count: 4 },
    { name: '月鳳', table: 12, g: 'f', count: 5, kids: 1, lap: 1, highchair: true, members: [{}, { g: 'f', img: 'img/yueh_female.png', ratio: 250 / 512 }, {}, { g: 'm', img: 'img/yueh_kid.png', ratio: 256 / 512 }] },     // 含一位男性幼兒（坐兒童座椅，不佔一般座位）
  ],
  // 桌子備註
  tableNotes: { 13: '預備桌' },
};
