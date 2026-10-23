# TYINSURE — Check Point 6 · ตรวจระบบแล้ว

Source commit: `78d75a76def0417f8c547b084d612d76870237ed`

จุดก่อนตรวจ: Check Point 6 Update 2 (`7cc510ef6622483f5f97b9816b9e1d5c64114436`)
จุดหลังตรวจ: `checkpoint-6-audited`

เว็บไซต์แบบ static ประกอบด้วยหน้าบำนาญ มรดก 99/20 วัยเก๋าคุ้มได้ใจ 99/10 วัยเก๋าคุ้มสุขใจ 90/90 และประกันสุขภาพ
รวมเบี้ยตามงวด/ทุกงวด และส่งออก PDF/Excel ตามที่ผู้ใช้อนุมัติ

แก้ตัวเลือกชดเชยวัยเก๋าคุ้มได้ใจทุน 200,000 ให้รองรับ 1,500 และ 2,000 ตาม source-4.png
ทดสอบ 30/30 ชุด และเทียบผลเดิม 7,568 กรณีเท่าเดิม ดู docs/audit-checkpoint-6.md

## Bigg: อัปโหลด GitHub

1. ตรวจ SHA256 ของ ZIP ตามไฟล์ manifest ที่ส่งคู่กัน
2. รัน `node run-tests.mjs` จากโฟลเดอร์ที่แตก ZIP ต้องผ่าน 30/30
3. นำไฟล์ชุดนี้ใส่ tyinsure/tyinsureteam บน main โดยรักษาไฟล์อื่นและตั้งค่าเดิม
4. ชุดนี้มีไฟล์เว็บไซต์ทั้งที่ root และ dist/ อยู่แล้ว ให้คงทั้งสองตำแหน่งตรงกัน
5. รวมทุกไฟล์ใหม่ของวัยเก๋า JSON CSS modules และ docs; ห้ามนำ .openai/ .git หรือ credentials ขึ้น GitHub
6. ตรวจ root/dist และไฟล์ตาม UPLOAD_MANIFEST.json หลังอัปโหลด ส่ง commit URL กลับ

การส่งครั้งนี้เป็น source upload ไม่ต้องสั่ง deploy หรือแก้ GitHub Pages settings

## เปิดทดสอบในเครื่อง

ใช้ static HTTP server ที่โฟลเดอร์ dist/ หรือ root ห้ามเปิดด้วย file://
ไม่มี dependency install หรือ build step สำหรับการใช้เว็บไซต์
ต้องมี Node.js สำหรับรันชุดทดสอบ
