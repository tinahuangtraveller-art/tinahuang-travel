import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import subsetFont from "subset-font";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const SOURCE = resolve(root, "public/fonts/JasonHandwriting2.woff2");
const OUTPUT = resolve(root, "public/fonts/JasonHandwriting2-subset.woff2");

const chars = new Set();

const latinBasic = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:;!?@#$%&*()[]{}<>/\\'\"`~^+=-_|";
for (const c of latinBasic) chars.add(c);

const cjkPunct = "，。！？、：；「」『』（）【】《》—…·〜～／＆";
for (const c of cjkPunct) chars.add(c);

const brand = "跟著黃踢那出發吧的旅行世界確認品牌視覺是否正";
for (const c of brand) chars.add(c);

const identity = "紀錄者攝影裸辭年薪百萬工程師主管給自己一挑戰靠養活";
for (const c of identity) chars.add(c);

const nav = "關於聯絡合作邀約文章攻略分類介紹聯盟揭露追蹤社群";
for (const c of nav) chars.add(c);

const regions = "台灣日本北海道東京都大阪京都奈良神戶名古屋福岡沖繩九州四國關西關東東北中部中國近畿山陽山陰宜蘭花蓮台東新竹苗栗彰化南投雲林嘉義屏東高雄基隆桃園台中台南苗栗雲嘉嵐山伊根美山天橋立長濱醒井白鬚村卻";
for (const c of regions) chars.add(c);

const travelVerbs = "搭乘玩吃看去買拍走住訪探遊逛看體驗分享記錄推薦整理計畫規劃前往到達出發回家出入境報到辦理預約預訂報名參加";
for (const c of travelVerbs) chars.add(c);

const travelNouns = "小火車JR新幹線電車巴士計程車機場車站碼頭船飛機高鐵捷運公車渡輪遊船吊椅纜車腳踏車";
for (const c of travelNouns) chars.add(c);

const accommodation = "住宿旅宿飯店民宿旅館溫泉酒店包棟訂房預訂房間客房雙人單人家庭房寵物房親子房";
for (const c of accommodation) chars.add(c);

const food = "美食餐廳咖啡廳茶屋喫茶吃飯早餐午餐晚餐下午茶甜點蛋糕麵包冰淇淋拉麵壽司天婦羅居酒屋";
for (const c of food) chars.add(c);

const prep = "行前準備網路網卡電壓插座保險換錢退稅免稅信用卡現金預約票券門票交通卡";
for (const c of prep) chars.add(c);

const time = "年月日季春夏秋冬天早晚上下午夜間時分秒週末平日假日連假";
for (const c of time) chars.add(c);

const numbers = "零一二三四五六七八九十百千萬億";
for (const c of numbers) chars.add(c);

const common = "我你他她們的了是在有這那就都也要可以會想沒覺得很非常比較最超一個每次還能夠開始繼續已經更多很多少很好很棒很美很值得推薦必走一定可能大概差不多左右附近旁邊中間裡面外面前面後面上面下面怎麼什麼為什麼哪裡哪個哪些誰時候為了因為所以但是不過雖然如果可以歡迎分享喜歡愛期待";
for (const c of common) chars.add(c);

const emojiBack = "🇯🇵🇹🇼📷🏨📍💛👀🎁📩✈️🚃⛩️🌊🛖♨️🏡🌸🍁❄️☕";
for (const c of emojiBack) chars.add(c);

const text = Array.from(chars).join("");

console.log(`Subsetting to ${chars.size} glyphs...`);

const source = await readFile(SOURCE);
console.log(`  source: ${(source.length / 1024).toFixed(0)} KB`);

const result = await subsetFont(source, text, {
  targetFormat: "woff2",
});

await writeFile(OUTPUT, result);
console.log(`  output: ${(result.length / 1024).toFixed(0)} KB`);
console.log(`  reduction: ${((1 - result.length / source.length) * 100).toFixed(1)}%`);
