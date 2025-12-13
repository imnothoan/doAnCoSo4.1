# Smart Exam - Nền tảng Khảo thí Thông minh

Ứng dụng di động React Native cho phép tổ chức và quản lý kỳ thi trực tuyến với hệ thống chống gian lận tích hợp.

**🌐 Hỗ trợ: Tiếng Việt | English**

## 🎯 Tổng quan

Smart Exam là nền tảng khảo thí thông minh được thiết kế cho:
- **Giảng viên**: Tạo đề thi, quản lý câu hỏi, quản lý lớp học
- **Sinh viên**: Làm bài thi trực tuyến với giám sát AI
- **Quản trị viên**: Xem kết quả và thống kê

### Tính năng chính:
- ✅ Tạo và quản lý đề thi (trắc nghiệm, đúng/sai, tự luận)
- ✅ Quản lý lớp học và sinh viên
- ✅ Hệ thống chống gian lận (Anti-cheat) với AI
- ✅ Hỗ trợ đa ngôn ngữ (Tiếng Việt/English)
- ✅ Thông báo lỗi thân thiện người dùng
- ✅ Bảo mật với Row Level Security

## 🚀 Công nghệ sử dụng

- **React Native** với **Expo** (~54.0.20)
- **TypeScript** cho type safety
- **Supabase** cho backend và xác thực
- **Expo Router** cho navigation
- **MediaPipe Face Mesh** cho nhận diện khuôn mặt
- **YOLO ONNX Model** cho phát hiện đối tượng
- **AsyncStorage** cho lưu trữ local

## ✨ Tính năng chi tiết

### Xác thực (Authentication)
- ✅ Đăng nhập với email/mật khẩu
- ✅ Đăng ký tài khoản
- ✅ Đổi ngôn ngữ (Tiếng Việt/English)
- ✅ Thông báo lỗi chi tiết và thân thiện
- ✅ Token management với AsyncStorage

### Quản lý Đề thi
- ✅ Tạo đề thi với nhiều cài đặt:
  - Thời gian làm bài
  - Điểm đạt
  - Xáo trộn câu hỏi/đáp án
  - Số lần làm tối đa
- ✅ Các loại câu hỏi:
  - Trắc nghiệm (Multiple choice)
  - Đúng/Sai (True/False)
  - Trả lời ngắn (Short answer)
  - Tự luận (Essay)
- ✅ Xuất bản/Hủy xuất bản đề thi
- ✅ Xem trước đề thi

### Quản lý Lớp học
- ✅ Tạo lớp học với mã lớp
- ✅ Mã mời tự động
- ✅ Thêm sinh viên theo email
- ✅ Quản lý danh sách sinh viên
- ✅ Gán đề thi cho lớp

### Hệ thống Chống gian lận (Anti-cheat)
- ✅ Phát hiện không có khuôn mặt
- ✅ Phát hiện nhiều người
- ✅ Phát hiện nhìn đi chỗ khác
- ✅ Phát hiện điện thoại (YOLO)
- ✅ Phát hiện tai nghe (YOLO)
- ✅ Đếm cảnh báo và tự động hủy bài thi

### Kết quả và Thống kê
- ✅ Xem điểm và tỷ lệ đúng
- ✅ Xem lại đáp án
- ✅ Thống kê lớp học
- ✅ Xuất báo cáo

## 📁 Cấu trúc dự án

```
doAnCoSo4.1/
├── app/                          # Screens (Expo Router)
│   ├── (tabs)/                   # Bottom tab screens
│   ├── auth/                     # Login, Signup
│   ├── exam/                     # Exam management
│   │   ├── create.tsx           # Create exam
│   │   ├── [id].tsx             # Exam detail
│   │   └── edit/[id].tsx        # Edit exam
│   ├── class/                    # Class management
│   │   ├── create.tsx           # Create class
│   │   ├── [id].tsx             # Class detail
│   │   └── students/[id].tsx    # Manage students
│   └── _layout.tsx              # Root layout
├── src/
│   ├── constants/
│   │   └── translations.ts      # Vietnamese/English translations
│   ├── context/
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── LanguageContext.tsx  # Language state
│   ├── services/
│   │   ├── examService.ts       # Exam API calls
│   │   └── yoloDetectionService.ts # YOLO detection
│   ├── types/
│   │   └── exam.ts              # Exam types
│   └── utils/
│       └── auth-helper.ts       # Auth utilities
├── components/
│   └── anticheat/
│       └── AntiCheatMonitor.tsx # Anti-cheat component
├── supabase/
│   └── schema.sql               # Database schema
└── assets/
    └── models/                  # AI models (ONNX)
```

## 🛠️ Cài đặt

### Yêu cầu
- Node.js (v16 trở lên)
- npm hoặc yarn
- Expo CLI (`npm install -g expo-cli`)
- Tài khoản Supabase

### Các bước cài đặt

1. **Clone repository**
   ```bash
   git clone https://github.com/imnothoan/doAnCoSo4.1.git
   cd doAnCoSo4.1
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Cấu hình Supabase**
   - Tạo project mới tại [supabase.com](https://supabase.com)
   - Chạy SQL schema trong `supabase/schema.sql`
   - Cập nhật `.env` với credentials của bạn:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Khởi chạy ứng dụng**
   ```bash
   npx expo start
   ```

5. **Chạy trên thiết bị**
   - Nhấn `i` để mở iOS Simulator
   - Nhấn `a` để mở Android Emulator
   - Quét QR code với Expo Go app

## 📱 Hướng dẫn sử dụng

### Dành cho Giảng viên

1. **Đăng nhập** với tài khoản giảng viên
2. **Tạo lớp học**:
   - Vào tab Classes > Create Class
   - Nhập tên lớp và mã lớp
3. **Thêm sinh viên**:
   - Chọn lớp > Manage Students
   - Nhập email sinh viên để thêm
4. **Tạo đề thi**:
   - Vào tab Exams > Create Exam
   - Nhập thông tin đề thi
   - Thêm câu hỏi (Step 2)
5. **Gán đề thi cho lớp**:
   - Mở đề thi > Assign to Class

### Dành cho Sinh viên

1. **Đăng nhập** với tài khoản sinh viên
2. **Tham gia lớp học** (được giảng viên thêm vào)
3. **Làm bài thi**:
   - Xem đề thi được gán
   - Nhấn "Start Exam"
   - Trả lời các câu hỏi
   - Nộp bài

## 🔒 Bảo mật

- Row Level Security (RLS) cho tất cả tables
- Mã hóa token và session
- Validation đầu vào ở cả client và server
- Chống SQL Injection và XSS

## 🌍 Đa ngôn ngữ

Ứng dụng hỗ trợ 2 ngôn ngữ:
- **Tiếng Việt** (mặc định)
- **English**

Để đổi ngôn ngữ: Nhấn nút ngôn ngữ ở màn hình đăng nhập hoặc trong Settings.

## 📝 Database Schema

Xem chi tiết trong `supabase/schema.sql`:
- `exams` - Thông tin đề thi
- `exam_questions` - Câu hỏi
- `question_options` - Đáp án trắc nghiệm
- `exam_classes` - Lớp học
- `class_members` - Thành viên lớp
- `exam_attempts` - Lần làm bài
- `student_answers` - Câu trả lời
- `anticheat_violations` - Vi phạm chống gian lận

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/TinhNangMoi`)
3. Commit changes (`git commit -m 'Thêm tính năng mới'`)
4. Push to branch (`git push origin feature/TinhNangMoi`)
5. Mở Pull Request

## 📄 Giấy phép

Dự án này là một phần của đồ án cơ sở.

## 👥 Tác giả

Được xây dựng bởi sinh viên.

---

**Trạng thái**: ✅ Sẵn sàng cho production testing!
