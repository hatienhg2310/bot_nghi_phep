# Discord Bot Xin Nghỉ Phép

Bot Discord chuyên nghiệp để quản lý yêu cầu nghỉ phép nội bộ công ty, tích hợp với Google Sheets.

## 🎯 Tính năng chính

- **Form xin nghỉ phép**: Nhân viên gửi yêu cầu qua DM với bot
- **Duyệt tự động**: Trưởng phòng nhận thông báo và duyệt/từ chối đơn
- **Thông báo HR**: Tự động gửi thông tin đơn đã duyệt đến channel HR
- **Lưu trữ dữ liệu**: Tự động cập nhật Google Sheets
- **Bảo mật**: Xác thực quyền hạn và validation dữ liệu

## 🚀 Cài đặt

### 1. Yêu cầu hệ thống
- Node.js 16.9.0 trở lên
- npm hoặc yarn
- Discord Bot Token
- Google Service Account

### 2. Clone repository
```bash
git clone <repository-url>
cd discord-bot-nghi-phep
```

### 3. Cài đặt dependencies
```bash
npm install
```

### 4. Cấu hình môi trường
Sao chép `.env.example` thành `.env` và điền thông tin:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:
```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_bot_client_id_here
HR_CHANNEL_ID=your_hr_channel_id_here

# Google Sheets Configuration  
GOOGLE_SHEETS_ID=186feLNr-gAvBXLhzDonjm85fWrOt59nHJd142onzBJ4
GOOGLE_SHEET_NAME=Sheet1
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"

# Department Manager Mapping
# ⚠️ IMPORTANT: Replace placeholder IDs with REAL Discord User IDs
# How to get Discord User ID:
# 1. Enable Developer Mode in Discord (User Settings > App Settings > Advanced > Developer Mode)
# 2. Right-click on the user > Copy User ID
MANAGER_NHAN_SU=your_real_discord_user_id_here
MANAGER_KE_TOAN=your_real_discord_user_id_here
MANAGER_KINH_DOANH=your_real_discord_user_id_here
MANAGER_KY_THUAT=your_real_discord_user_id_here
MANAGER_MARKETING=your_real_discord_user_id_here
```

### 5. Deploy commands
```bash
node src/deploy-commands.js
```

### 6. Khởi chạy bot
```bash
npm start
```

Hoặc chế độ development:
```bash
npm run dev
```

## 📋 Hướng dẫn sử dụng

### Cho nhân viên:
1. Gửi tin nhắn riêng (DM) với bot
2. Sử dụng lệnh `/form` để mở form xin nghỉ phép
3. Điền đầy đủ thông tin trong form
4. Chờ trưởng phòng duyệt

### Cho trưởng phòng:
1. Nhận thông báo DM từ bot khi có đơn mới
2. Nhấn nút "✅ Duyệt" hoặc "❌ Từ chối"
3. Hệ thống tự động xử lý và thông báo

### Cho HR:
1. Nhận thông báo trong channel HR khi đơn được duyệt
2. Dữ liệu tự động cập nhật vào Google Sheets

## 🔧 Cấu hình

### Phòng ban và Trưởng phòng
Chỉnh sửa trong `src/config/config.js`:
```javascript
departments: [
  'Nhân sự',
  'Kế toán', 
  'Kinh doanh',
  'Kỹ thuật',
  'Marketing'
],

departmentManagers: {
  'Nhân sự': 'DISCORD_USER_ID',
  'Kế toán': 'DISCORD_USER_ID',
  // ...
}
```

### Google Sheets
- Cột B-I: Dữ liệu form
- Cột J: Trạng thái ("Đã duyệt"/"Từ chối")
- Dòng 1: Header
- Dữ liệu bắt đầu từ dòng 2

## 🛡️ Bảo mật

- Validation dữ liệu đầu vào
- Xác thực quyền hạn trưởng phòng
- Sanitize input để tránh injection
- Rate limiting tự nhiên qua Discord API

## 📊 Logging

Bot ghi log các hoạt động quan trọng:
- Gửi/nhận form
- Duyệt/từ chối đơn
- Cập nhật Google Sheets
- Lỗi hệ thống

## 🔍 Troubleshooting

### Bot không phản hồi
- Kiểm tra token Discord
- Đảm bảo bot có quyền gửi DM
- Kiểm tra intents trong Developer Portal

### Lỗi Google Sheets
- Xác minh Service Account credentials
- Kiểm tra quyền truy cập spreadsheet
- Đảm bảo API được bật

### Lỗi permissions
- Bot cần quyền "Send Messages" trong channel HR
- Service Account cần quyền "Editor" cho Google Sheets

## 📝 API Reference

### Commands
- `/form` - Mở form xin nghỉ phép (chỉ DM)

### Events
- `ready` - Bot khởi động
- `interactionCreate` - Xử lý slash commands, modals, buttons

### Services
- `GoogleSheetsService` - Quản lý tương tác Google Sheets
- `EmbedUtils` - Tạo Discord embeds
- `Validators` - Validation dữ liệu

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết chi tiết.

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ team phát triển.
