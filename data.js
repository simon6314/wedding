// 婚宴設定：之後把名字、日期、賓客名單換成真的就好
// guests 目前是假資料（自動產生）；要換成真名單時，照下面格式填進 GUESTS 陣列即可：
//   一筆 = 一份報名（一家人填一次就好）
//   { name: '王小明', table: 3, g: 'm', count: 4, kids: 2 }
//     name  填表的人（代表）        table 桌號
//     g     代表的性別 'm' 男 / 'f' 女
//     count 這一家總共幾位（含代表，不填就是 1 位）
//     kids  其中幾位是小朋友（不填就是 0）
//     lap   小朋友裡有幾位不佔座位（坐大人腿上）；baby: true 表示是嬰兒（畫得更小）
//     note  身分備註，例如 '主持人'、'婚禮歌手'
//   畫面上會出現 count 個人：代表本人＋「王小明的家人」，同一家坐在一起，
//   點桌子會顯示「王小明（一家 4 位）」，搜尋王小明會把一家人一起標出來。
window.WEDDING = {
  title: '我們的婚禮派對',
  groom: '新郎',
  bride: '新娘',
  date: '',                 // 例如 '2027.03.20'
  venue: 'Honeywood 美式饗宴',
  // 主桌：新郎新娘＋雙方主婚人（名字可改）
  vip: [
    { id: 'groom', name: '新郎', role: 'groom' },
    { id: 'bride', name: '新娘', role: 'bride' },
    { id: 'gdad', name: '男方主婚人（爸爸）', role: 'dad', side: 'g' },
    { id: 'gmom', name: '男方主婚人（媽媽）', role: 'mom', side: 'g' },
    { id: 'bdad', name: '女方主婚人（爸爸）', role: 'dad', side: 'b' },
    { id: 'bmom', name: '女方主婚人（媽媽）', role: 'mom', side: 'b' },
  ],
  // 真名單放這裡；留 null 就會用假資料
  GUESTS: [
    // 第 2 桌
    { name: '姵汝', table: 2, g: 'f' },
    { name: '鈺庭', table: 2, g: 'f', count: 3, kids: 1, lap: 1, baby: true },   // 兩位成人＋未滿一歲幼兒
    { name: '明兌', table: 2, g: 'm', count: 2, kids: 1 },                       // 一位成人＋一位兒童
    // 第 3 桌
    { name: '麗珠', table: 3, g: 'f' },
    { name: '品劭', table: 3, g: 'm' },
    { name: '芸岑', table: 3, g: 'f', count: 2 },
    // 第 4 桌
    { name: '建智', table: 4, g: 'm', count: 2, note: '主持人' },
    { name: 'glenn', table: 4, g: 'm', count: 2, note: '婚禮歌手' },
    // 第 5 桌
    { name: '宜妏', table: 5, g: 'f', count: 5 },
    { name: '新娘大姨', table: 5, g: 'f' },
    // 第 6 桌
    { name: '宜秀', table: 6, g: 'f' },
    { name: '淑鈴', table: 6, g: 'f' },
    { name: '昱靜', table: 6, g: 'f' },
    { name: '芃磬', table: 6, g: 'f' },
    { name: '瀅琦', table: 6, g: 'f' },
    { name: '士堯', table: 6, g: 'm' },
    // 第 7 桌（共 9 位，比平面圖寫的 6–8 位多 1 位）
    { name: '宗益', table: 7, g: 'm', count: 4 },
    { name: '新娘大姑', table: 7, g: 'f' },
    { name: '玫秀', table: 7, g: 'f' },
    { name: '玉智', table: 7, g: 'f' },
    { name: '小燕阿姨', table: 7, g: 'f' },
    { name: '莊阿姨', table: 7, g: 'f' },
    // 第 8 桌
    { name: '峻緯', table: 8, g: 'm', count: 3 },
    { name: '筠霏', table: 8, g: 'f', count: 2 },
    { name: '仲蔚', table: 8, g: 'm' },
    // 第 9 桌
    { name: '國隆', table: 9, g: 'm' },
    { name: '月嬌', table: 9, g: 'f' },
    { name: '新郎二舅媽', table: 9, g: 'f' },
    { name: '佳紋', table: 9, g: 'f' },
    { name: '明偉', table: 9, g: 'm' },
    // 第 10 桌
    { name: '逸凱', table: 10, g: 'm', count: 4 },
    { name: '娸華', table: 10, g: 'f', count: 2 },
    // 第 11 桌
    { name: '國慶', table: 11, g: 'm', count: 4 },
    { name: '月裡', table: 11, g: 'f', count: 2 },
    { name: '新郎阿嬤', table: 11, g: 'f', elder: true },
    { name: '新郎二舅舅', table: 11, g: 'm' },
    // 第 12 桌
    { name: '民政', table: 12, g: 'm', count: 4 },
    { name: '新郎三姑姑', table: 12, g: 'f', count: 5, kids: 1, lap: 1 },     // 含一位兒童（座椅不佔位）
  ],
  // 桌子備註
  tableNotes: { 1: '預備桌' },
};
