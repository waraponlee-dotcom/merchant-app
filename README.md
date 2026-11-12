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
| `/dashboard` | แดชบอร์ดร้าน — summary, shop info, stock, export all order attempts to CSV |
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
- `actions.receiveTokens({...})` records each Handheld Scanner payment attempt with its outcome status. The dev-only buttons on `/scanner` simulate the outcomes.
- Reset demo data: `actions.reset()` or delete the key in DevTools → Application → Local Storage.
- Every scan attempt creates a transaction, including insufficient-token attempts (`insufficient`) and disconnected attempts (`pending`). Only `success` transactions count toward received-token and sold-quantity totals.
- Order numbers are booth-prefixed and zero-padded, e.g. `B12-0001`. The per-booth counter is persisted in this browser; older saved transactions are assigned numbers when loaded. A shared backend must issue numbers if multiple devices need a globally unique sequence.
- The `/dashboard` CSV button exports all transactions and statuses as UTF-8 CSV with a BOM for Thai spreadsheet compatibility.

## Logout integration
- The navigation logout button removes the authentication value stored under the `credential` key in `localStorage`, then returns to `/`.
- This project does not include a login screen, credential creation, or route protection. The authentication owner must save the real credential under this key and connect the app's route/session guard when that integration is ready.
- Do not store a production secret in a `NEXT_PUBLIC_` variable. If authentication uses an HttpOnly cookie or server session instead of this localStorage key, update the logout helper to call the authentication provider/server endpoint.

## utils/ (Token system ที่ทีมอื่นดึงไปใช้ได้)
- `utils/token.ts` — logic ล้วน ไม่พึ่ง React: `calcTotalMer`, `checkPaymentMer`, `buildTxMer`, `fmtTokenMer`, types `TokenTxMer`, `ScanResultMer` …
- `utils/scanFlow.ts` — `runScanMer(kind)`, `reconnectScanMer()`, `useScanResultMer()`; ปุ่มจำลองแสดงเสมอ ซ่อนได้ด้วย `NEXT_PUBLIC_HIDE_SIM=1`
- ชื่อตัวแปร/ฟังก์ชัน/type ทุกตัวที่เขียนใหม่ลงท้ายด้วย `Mer`
