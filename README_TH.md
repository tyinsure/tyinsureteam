# TYINSURE — สำหรับ Bigg

ชุดไฟล์ GitHub ฉบับล่าสุด วันที่ 22 ตุลาคม 2026 รวมซีไอ เพอร์เฟค แคร์ และการย้ายผลประโยชน์เข้าไปในกล่องทุนประกัน
Source commit: e0fec72456b9fc60273d261185929325f945688e

## อัปโหลดขึ้น GitHub

1. แตก ZIP นี้
2. สร้าง repository หรือเปิด repository ที่ต้องการ
3. อัปโหลดไฟล์และโฟลเดอร์ทั้งหมดที่แตกได้ โดยคงโครงสร้างเดิม และ commit
4. ต้องมี dist/index.html อยู่ใน repository ไม่ใช่อัปโหลด ZIP เพียงไฟล์เดียว

โฟลเดอร์ dist/ คือเว็บไซต์พร้อมใช้งาน โค้ดทดสอบอยู่ที่ root
ไฟล์การผูกโปรเจกต์กับ Sites (.openai/) ถูกตัดออกจากชุดสำหรับ GitHub นี้
ชุดนี้เป็นเวอร์ชันพัฒนาต่อจาก Check Point 2 ไม่ได้แทนที่ชุดสำรอง Check Point 2 เดิม

## เผยแพร่ด้วย GitHub Pages

1. เปิด Settings > Pages ใน repository แล้วเลือก Source เป็น GitHub Actions
2. เปิด Actions > Deploy TYINSURE to GitHub Pages > Run workflow
3. เลือก branch ที่อัปโหลดไฟล์ไว้ แล้วกด Run workflow
4. รอ workflow สำเร็จ และเปิด URL ใน environment github-pages

workflow นี้เริ่มเมื่อกดสั่งรันเอง เพื่อให้เลือกเวลาที่เผยแพร่ได้
การใช้งาน Pages ขึ้นกับสิทธิ์และแพ็กเกจของ repository

## เผยแพร่ด้วย Netlify

เชื่อม repository กับ Netlify โดยไม่มี build command และตั้ง Publish directory เป็น dist
มี netlify.toml กำหนดค่าไว้ให้แล้ว
ถ้าอัปโหลดด้วย Netlify Drop ให้ลากเฉพาะโฟลเดอร์ dist

## พัฒนาต่อ

ใช้ Node.js รุ่นปัจจุบันที่รองรับ ES modules แล้วรัน:

    node run-tests.mjs

หลังเพิ่มซีไอตรวจผ่าน 20 ชุดทดสอบ และหลังย้ายกล่องตรวจผ่าน CI UI และ local references เพิ่มเติม
เปิดดูผ่าน static HTTP server แทนการดับเบิลคลิกไฟล์ HTML เพราะเว็บใช้ fetch และ ES modules

## ข้อสังเกต

- อัตราเบี้ยแผนเดิมคงเดิม และเพิ่มอัตราเบี้ยซีไอ 680 ค่า ตามภาพต้นฉบับใน docs/ci-perfect-care
- ยังไม่มี favicon.ico จึงอาจมีคำขอไอคอนตอบกลับ 404
- คำเตือนส่วนขยาย Firefox/MetaMask เกิดจากส่วนขยายของเบราว์เซอร์
- ปัญหา cookie __cf_bm ที่ตรวจพบเป็นของระบบโฮสติ้ง Sites เดิม ไม่ใช่โค้ดที่ตั้ง cookie ในชุดนี้
- การอัปโหลดชุดนี้ไม่เปลี่ยนเว็บไซต์ Sites เดิมโดยอัตโนมัติ