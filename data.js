// 婚宴設定：之後把名字、日期、賓客名單換成真的就好
// guests 目前是假資料（自動產生）；要換成真名單時，照下面格式填進 GUESTS 陣列即可：
//   { name: '王小明', table: 3, g: 'm' }      g: 'm' 男 / 'f' 女；kid: true 是小朋友；elder: true 長輩
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
