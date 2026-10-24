# TYINSURE — Check Point 8 สำหรับ GitHub

Source commit: `92efce29c6e8b2067953977ea77bc125c64f54c1`
Git tag: `checkpoint-8`

รุ่นนี้มีปุ่มตารางแสดงเบี้ยตามโหมดชำระ/เบี้ยทั้งปีทั่วโปรเจกต์ และ PDF ตามมุมมองที่เลือก
ดูรายละเอียด docs/project-schedule-premium-views.md และ docs/checkpoints/checkpoint-8.md

## อัปโหลด

1. แตก ZIP แล้วอัปโหลดไฟล์และโฟลเดอร์ภายในไปที่ root ของ tyinsure/tyinsureteam บน main
2. มีเว็บไซต์ทั้ง root และ dist/ ซึ่งตรงกัน ให้อัปโหลดทั้งสองตำแหน่ง
3. รักษาไฟล์อื่น โฟลเดอร์ .github และการตั้งค่าเดิมของ repository ห้ามลบไฟล์ที่ไม่ได้อยู่ในชุดนี้
4. รวมไฟล์ใหม่ทั้งหมดโดยเฉพาะ schedule-premium-view.mjs ทั้ง root และ dist/
5. ไม่มี .openai/ .git credentials หรือ runtime folders ในชุดอัปโหลด
6. ตรวจ UPLOAD_MANIFEST.json หลังอัปโหลด และส่ง commit URL กลับ

ไม่ต้องสั่ง deploy หรือเปลี่ยน GitHub Pages เป็นการอัปโหลดซอร์สเท่านั้น

## ทดสอบ

รัน `node run-tests.mjs` จากโฟลเดอร์แตก ZIP ต้องผ่าน 32/32 ชุด
เว็บ static ไม่มี dependency install/build step เปิดผ่าน HTTP server ที่ root หรือ dist/ ไม่ใช้ file://
