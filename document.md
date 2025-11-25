🧩 Tài liệu kỹ thuật: Discord Bot Xin Nghỉ Phép
1. Mục tiêu hệ thống

Xây dựng một Discord Bot phục vụ nội bộ công ty, giúp nhân viên gửi yêu cầu xin nghỉ phép, trưởng phòng duyệt hoặc từ chối đơn, và HR nhận thông tin đã được duyệt, đồng thời lưu dữ liệu vào Google Sheets.

2. Luồng hoạt động tổng quan
🧍 Nhân viên

Nhân viên gửi tin nhắn trực tiếp (DM) với bot.

Gõ lệnh /form để mở form xin nghỉ phép.

Điền các trường bắt buộc:

Email công ty

Mã nhân viên

Họ và tên

Phòng ban

Ngày nghỉ

Thời gian nghỉ

Lý do nghỉ

Quản lý trực tiếp (họ tên hoặc ID Discord)

Sau khi gửi form, bot sẽ tự động xử lý.

👨‍💼 Trưởng phòng

Bot xác định trưởng phòng tương ứng dựa trên phòng ban mà nhân viên đã chọn.
→ Các ID Discord của trưởng phòng sẽ được cấu hình trong file config hoặc Google Sheet mapping.

Bot gửi tin nhắn Direct Message (DM) đến trưởng phòng, hiển thị:

Yêu cầu nghỉ phép mới:
- Email: ...
- Mã NV: ...
- Họ tên: ...
- Phòng ban: ...
- Ngày nghỉ: ...
- Thời gian: ...
- Lý do: ...
- Quản lý trực tiếp: ...
🧾 Bộ phận HR

Khi đơn được duyệt, bot sẽ:

Gửi tin nhắn vào channel HR (cấu hình sẵn trong config), nội dung gồm:

✅ Đơn nghỉ phép được duyệt:
- Email: ...
- Mã NV: ...
- Họ tên: ...
- Phòng ban: ...
- Ngày nghỉ: ...
- Thời gian: ...
- Lý do: ...
- Quản lý trực tiếp: ...


Ghi dữ liệu vào Google Sheets theo đường dẫn:
https://docs.google.com/spreadsheets/d/186feLNr-gAvBXLhzDonjm85fWrOt59nHJd142onzBJ4/edit?gid=861376981


Ghi từ cột B → I, tương ứng với các trường của form.

Cột J ghi trạng thái = "Đã duyệt" hoặc "Từ chối".

Dòng bắt đầu ghi từ index = 2 (bỏ qua header).


Thông tin ghi Google Sheets
Cột	Trường dữ liệu	Mô tả
B	Email	Email nhân viên
C	Mã nhân viên	Mã nội bộ
D	Họ và tên	Họ và tên nhân viên
E	Phòng ban	Bộ phận công tác
F	Ngày nghỉ	Dạng dd/mm/yyyy
G	Thời gian nghỉ	Buổi sáng / chiều / cả ngày
H	Lý do nghỉ	Text
I	Quản lý trực tiếp	Họ tên hoặc ID
J	Trạng thái	“Đã duyệt” / “Từ chối”





