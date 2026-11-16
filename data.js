// 婚宴設定：之後把名字、日期、賓客名單換成真的就好
// guests 目前是假資料（自動產生）；要換成真名單時，照下面格式填進 GUESTS 陣列即可：
//   一筆 = 一份報名（一家人填一次就好）
//   { name: '王小明', table: 3, g: 'm', count: 4, kids: 2 }
//     name  填表的人（代表）        table 桌號
//     g     代表的性別 'm' 男 / 'f' 女
//     count 這一家總共幾位（含代表，不填就是 1 位）
//     kids  其中幾位是小朋友（不填就是 0）
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
  GUESTS: null,
};
