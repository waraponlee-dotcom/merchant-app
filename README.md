# Merchant app (Next.js 14 · TSX · Tailwind) — mobile first

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_ADMIN_API_URL when the Super Admin API is ready
npm run dev                  # http://localhost:3000  (open on a phone-sized screen)
```

## Pages
| Route | What |
|---|---|
| `/` | หน้าหลัก — total / today tokens, product strip, latest received |
| `/scanner` | ปรับจำนวน + กล้องสแกน QR + ปุ่มจำลองผลสแกน 3 แบบ (dev) |
| `/scanner/result` | ผลการรับชำระ: สำเร็จ / Token ลูกค้าไม่พอ / Scanner หลุดการเชื่อมต่อ |
| `/dashboard` | แดชบอร์ดร้าน — summary, shop info, stock |
| `/dashboard/detail` | latest transactions + รายงานสรุป per day |
| `/dashboard/all` | today's transactions (7 at a time) + สรุปวันนี้ |
| `/help` | contact Super Admin + FAQ |

## Values from Super Admin
Nothing about the shop/product is hardcoded any more. `lib/api.ts → fetchMerchantConfig()` calls
`GET {NEXT_PUBLIC_ADMIN_API_URL}/merchant/config` (on load, every 60 s, and when the app returns to the foreground).
The result is validated by `normalizeConfig` (lib/config.ts), stored in `localStorage` as a cache, and read through `useStore().config`.
If the request fails the last cached config is kept. Without `NEXT_PUBLIC_ADMIN_API_URL` the demo defaults in `defaultConfig()` are used.

Expected response (every field optional — missing ones fall back to defaults; `{ "data": {...} }` wrapper also accepted):
```json
{
  "tokenSymbol": "TKN",
  "shopOpen": true,
  "profile": { "shopName": "ร้านชานมนราวดี", "booth": "B12", "fullName": "นราวดี ชัยสิทธิ์", "email": "merchant@example.com" },
  "product": { "name": "ชานมไข่มุก", "unit": "แก้ว", "unitPrice": 40, "initialStock": 400 },
  "maxQty": 20,
  "openingDays": [{ "date": "2026-10-27", "qty": 249, "tokens": 9960 }],
  "support": { "name": "Super Admin", "phone": "02-000-0000", "lineId": "@superadmin", "email": "admin@example.com", "hours": "ทุกวัน 09:00 – 22:00" },
  "notice": "Token ใช้ภายในงาน หากต้องการแลกเป็นเงินสด โปรดติดต่อ Super Admin หลังจบงาน"
}
```
`initialStock: null` → "สินค้าคงเหลือ" and "จำนวนสินค้าเริ่มต้น" show `--`.
Each transaction stores the token amount at the price in effect when it was received, so a later price change never rewrites history.

## Tokens (still local)
- `lib/store.ts` keeps received tokens in `localStorage` (`merchant-app:v2`). Replace `load`/`persist` with an API later.
- `actions.setQty(n)` is written by **/scanner** and read by **/**.
- `actions.receiveTokens({...})` is what the Handheld Scanner callback will call. A dev-only button on /scanner simulates it.
- Reset demo data: `actions.reset()` or delete the key in DevTools → Application → Local Storage.

## utils/ (Token system ที่ทีมอื่นดึงไปใช้ได้)
- `utils/token.ts` — logic ล้วน ไม่พึ่ง React: `calcTotalMer`, `checkPaymentMer`, `buildTxMer`, `fmtTokenMer`, types `TokenTxMer`, `ScanResultMer` …
- `utils/scanFlow.ts` — `runScanMer(kind)`, `reconnectScanMer()`, `useScanResultMer()`; ปุ่มจำลองแสดงเสมอ ซ่อนได้ด้วย `NEXT_PUBLIC_HIDE_SIM=1`
- ชื่อตัวแปร/ฟังก์ชัน/type ทุกตัวที่เขียนใหม่ลงท้ายด้วย `Mer`
