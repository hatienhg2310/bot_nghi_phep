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
```

### 5. Cấu hình danh sách quản lý

Chỉnh sửa file `id.csv` để thêm danh sách quản lý và Discord User ID của họ:

```csv
STT,Họ và tên,Chức vụ,ID
1,Nguyễn Văn A,Department Manager,123456789012345678
2,Trần Thị B,Leader Marketing,234567890123456789
3,Lê Văn C,Leader Designer,345678901234567890
```

**Cách lấy Discord User ID:**
1. Bật **Developer Mode** trong Discord: `User Settings > App Settings > Advanced > Developer Mode`
2. Click chuột phải vào tên người dùng > **Copy User ID**

**⚠️ Lưu ý quan trọng:**
- Tên trong file CSV phải khớp **CHÍNH XÁC** (bao gồm hoa/thường, dấu) với tên mà nhân viên nhập vào form
- Khi nhân viên điền form, họ sẽ nhập tên quản lý trực tiếp, bot sẽ tự động tìm Discord ID tương ứng từ file này

### 6. Deploy commands
```bash
node src/deploy-commands.js
```

### 7. Khởi chạy bot
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

### Phòng ban

Danh sách phòng ban được sử dụng trong form dropdown. Chỉnh sửa trong `src/config/config.js`:

```javascript
departments: [
  'Nhân sự',
  'Kế toán', 
  'Kinh doanh',
  'Kỹ thuật',
  'Marketing'
],
```

**⚠️ Lưu ý:** Phòng ban chỉ dùng để hiển thị thông tin, **KHÔNG** dùng để xác định người duyệt đơn.

### Quản lý và người duyệt đơn

Danh sách quản lý được quản lý trong file `id.csv`:

```csv
STT,Họ và tên,Chức vụ,ID
1,Phạm Tuấn Anh,Department Manager,1353938845812654150
2,Bùi Phương Linh,Department Manager,1399621564240232508
3,Võ Hoài Nam,Leader Marketing,1355009413878120540
```

**Cách hoạt động:**
1. Nhân viên nhập tên "Quản lý trực tiếp" vào form (ví dụ: "Phạm Tuấn Anh")
2. Bot tự động tìm Discord ID tương ứng trong file `id.csv`
3. Bot gửi thông báo duyệt đơn đến Discord ID đó

**⚠️ Quan trọng:** Tên phải khớp **CHÍNH XÁC** (hoa/thường, dấu) giữa form và file CSV

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
