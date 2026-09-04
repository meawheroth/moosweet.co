# MooSweet Full Stack
นำหน้าเว็บ MooSweet มารวมกับ Express + MongoDB + JWT starter

## Run
1. `npm install`
2. สร้าง `.env` จากค่าตัวอย่าง และใส่ `MONGO_URI` กับ `JWT_SECRET`
3. `npm start`
4. เปิด `http://localhost:3000`

## ฟีเจอร์
- เมนูขนมจาก MongoDB
- สมัครสมาชิก / login / logout ด้วย JWT cookie
- ตะกร้าสินค้าเก็บใน localStorage
- checkout ต้อง login และบันทึก purchaseHistory
- admin.html เพิ่ม/แก้ไข/ลบสินค้า (ระบบ starter ยังไม่มี role admin)


## Admin + Order Management

เพิ่มระบบผู้ดูแลและสถานะออเดอร์แล้ว

### สร้าง Admin
1. ตั้งค่า `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` ใน `.env`
2. รัน `npm run create-admin`
3. Login ด้วยบัญชี Admin ระบบจะพาไป `admin.html` อัตโนมัติ

### สถานะออเดอร์
`pending` รอตรวจสอบ → `confirmed` ยืนยันออเดอร์ → `preparing` กำลังเตรียม → `shipping` กำลังจัดส่ง → `completed` สำเร็จ หรือ `cancelled` ยกเลิก

### API เพิ่มเติม
- `GET /api/orders/history` ประวัติของลูกค้า
- `GET /api/orders/admin` รายการออเดอร์ทั้งหมด (Admin)
- `PATCH /api/orders/:id/status` เปลี่ยนสถานะ (Admin)
- `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id` ต้องเป็น Admin
