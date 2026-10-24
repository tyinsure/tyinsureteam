# TYINSURE — OPD เหมาจ่ายและ OPD ต่อครั้ง

Source commit: d03395a60b74abceced3490f9abb410caf696ac2
วันที่ 24 ตุลาคม 2026

เพิ่ม OPD เหมาจ่าย 6 แผน และ OPD ต่อครั้ง 7 แผน พร้อมเบี้ย 4 โหมดชำระ
รวมเบี้ย ตารางรายปี/ตามโหมดชำระ LINE PDF และ Excel แล้ว
รัน node run-tests.mjs ต้องผ่าน 35/35 ชุด

สำหรับ Bigg: อัปโหลดไฟล์ชุดนี้ไปยัง tyinsure/tyinsureteam สาขา main
คงเว็บไซต์ที่ root และ dist/ ให้ตรงกัน ตรวจไฟล์ด้วย UPLOAD_MANIFEST.json
รักษาไฟล์อื่นและการตั้งค่าเดิม รวมถึง .github/ ไม่ต้องสั่ง deploy หรือเปลี่ยน GitHub Pages
ไม่อัปโหลด .openai/ .git/ credentials หรือไฟล์ชั่วคราว
เปิดเว็บไซต์ผ่าน static HTTP server ไม่มีขั้นตอนติดตั้ง dependency หรือ build
