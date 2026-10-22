# TYINSURE — Check Point 5 สำหรับ Bigg

วันที่ 22 ตุลาคม 2026
Source commit: c31a66f14462be3df1fa825eabb9fd85b9c070d7
ก่อน Debug: Check Point 4 commit 3c82a643adfe7646ea9b6e22781464fcbd84dc1a

อัปโหลดไปยัง repository tyinsure/tyinsureteam ตามที่ผู้ใช้มอบหมาย
ชุดนี้รวมสรุป PDF D Health Lite, Elite Health Plus, Care Plus ทุกแผน, CI และค่าชดเชยรายวัน
ผ่าน 24/24 ชุดทดสอบ และตรวจการส่งออกจริง PDF 8 หน้า / Excel
รายละเอียดการตรวจอยู่ใน docs/checkpoints/checkpoint-5.md

## โครงสร้างและการอัปโหลด

- แตก ZIP และอัปโหลดไฟล์ทั้งหมดตามโครงสร้างเดิม ไม่อัปโหลด ZIP แทนไฟล์เว็บ
- dist/ คือเว็บไซต์พร้อมใช้ ไฟล์ทดสอบอยู่ที่ root
- repository เดิมมีไฟล์เว็บที่ root ด้วย ให้ซิงก์สำเนา root จาก dist/ ทุกไฟล์ รวม assets และ modules ใหม่ เพื่อไม่ให้เว็บ root เป็นรุ่นเก่า
- รักษาไฟล์ของ repository ที่ไม่เกี่ยวข้อง ไม่ลบ workflow หรือเอกสารของผู้อื่น
- ชุดนี้ตัด .openai/ ซึ่งผูกกับ Sites ออก และไม่รวม .git หรือข้อมูลรับรอง
- รัน node run-tests.mjs จากโฟลเดอร์ที่แตกแล้วก่อนอัปโหลด
- ตรวจไฟล์ dist/ และสำเนาเว็บ root ให้ตรงกับชุดนี้หลังอัปโหลด
- ไม่สั่งเผยแพร่ GitHub Pages เพิ่มเอง การส่งครั้งนี้มอบหมายให้อัปโหลด GitHub

## เปิดใช้งาน

ใช้ static HTTP server ให้ document root เป็น dist/ เว็บใช้ ES modules และ fetch จึงควรเปิดผ่าน HTTP
Netlify: Publish directory = dist, ไม่ต้อง build
GitHub Pages: มี workflow สั่งรันเองใน .github/workflows/pages.yml เช่นชุดเดิม

การแก้รอบ Debug จำกัดเฉพาะ favicon ทุกหน้า และลบตัวแปร PDF ที่ไม่ได้ใช้ 2 จุด สูตรและอัตราเบี้ยคงเดิม
สำรองก่อนตรวจ: TYINSURE_Check_Point_4.zip
สำรองหลังตรวจ: TYINSURE_Check_Point_5.zip
