/**
 * Translations for Smart Examination Platform
 * Supports Vietnamese (vi) and English (en)
 */

export type Language = 'vi' | 'en';

export interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    confirm: string;
    back: string;
    next: string;
    submit: string;
    close: string;
    refresh: string;
    noData: string;
    required: string;
    optional: string;
    actions: string;
    yes: string;
    no: string;
    ok: string;
  };

  // Auth
  auth: {
    login: string;
    signup: string;
    logout: string;
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    fullName: string;
    forgotPassword: string;
    welcomeBack: string;
    signInToContinue: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    signingIn: string;
    signingUp: string;
    // Error messages
    emailRequired: string;
    passwordRequired: string;
    invalidCredentials: string;
    emailAlreadyExists: string;
    weakPassword: string;
    networkError: string;
    invalidEmail: string;
    passwordMismatch: string;
    usernameRequired: string;
    nameRequired: string;
    loginFailed: string;
    signupFailed: string;
  };

  // Dashboard/Navigation
  navigation: {
    dashboard: string;
    exams: string;
    classes: string;
    students: string;
    results: string;
    settings: string;
    profile: string;
    anticheat: string;
  };

  // Exam Management
  exam: {
    createExam: string;
    editExam: string;
    examList: string;
    examTitle: string;
    examDescription: string;
    duration: string;
    durationMinutes: string;
    startTime: string;
    endTime: string;
    totalQuestions: string;
    totalPoints: string;
    passingScore: string;
    shuffleQuestions: string;
    shuffleAnswers: string;
    showResults: string;
    allowReview: string;
    maxAttempts: string;
    questions: string;
    addQuestion: string;
    editQuestion: string;
    deleteQuestion: string;
    questionText: string;
    questionType: string;
    multipleChoice: string;
    trueFalse: string;
    shortAnswer: string;
    essay: string;
    options: string;
    addOption: string;
    correctAnswer: string;
    points: string;
    explanation: string;
    questionNumber: string;
    noQuestions: string;
    confirmDeleteQuestion: string;
    confirmDeleteExam: string;
    examCreatedSuccess: string;
    examUpdatedSuccess: string;
    examDeletedSuccess: string;
    questionAddedSuccess: string;
    questionUpdatedSuccess: string;
    questionDeletedSuccess: string;
    startExam: string;
    submitExam: string;
    timeRemaining: string;
    examInProgress: string;
    examCompleted: string;
    yourScore: string;
    passed: string;
    failed: string;
    assignToClass: string;
    previewExam: string;
    publishExam: string;
    unpublishExam: string;
    draft: string;
    published: string;
    archived: string;
    enterExamTitle: string;
    enterExamDescription: string;
    enterQuestionText: string;
    enterOptionText: string;
    selectCorrectAnswer: string;
    enterPoints: string;
    enterExplanation: string;
    minOneOption: string;
    minTwoOptions: string;
    selectQuestionType: string;
    invalidDuration: string;
    invalidPoints: string;
    examTitleRequired: string;
    durationRequired: string;
    loadExamError: string;
    deleteExamError: string;
    deleteQuestionError: string;
    updateExamError: string;
  };

  // Class Management
  class: {
    createClass: string;
    editClass: string;
    classList: string;
    className: string;
    classCode: string;
    classDescription: string;
    instructor: string;
    students: string;
    addStudent: string;
    removeStudent: string;
    studentCount: string;
    examCount: string;
    noClasses: string;
    noStudentsInClass: string;
    confirmRemoveStudent: string;
    confirmDeleteClass: string;
    classCreatedSuccess: string;
    classUpdatedSuccess: string;
    classDeletedSuccess: string;
    studentAddedSuccess: string;
    studentRemovedSuccess: string;
    enterClassName: string;
    enterClassCode: string;
    enterClassDescription: string;
    classNameRequired: string;
    classCodeRequired: string;
    viewStudents: string;
    manageStudents: string;
    assignExam: string;
    viewExams: string;
    classExams: string;
    classDetails: string;
    joinClass: string;
    leaveClass: string;
    inviteStudents: string;
    generateInviteCode: string;
    inviteCode: string;
    copyCode: string;
    codeCopied: string;
    searchStudentByEmail: string;
    studentNotFound: string;
    studentAlreadyInClass: string;
    addingStudent: string;
    addStudentError: string;
    addByEmail: string;
    addByCode: string;
    studentEmail: string;
    loadClassError: string;
    deleteClassError: string;
    removeStudentError: string;
  };

  // Student Management
  student: {
    studentList: string;
    studentProfile: string;
    studentId: string;
    enrolledClasses: string;
    completedExams: string;
    averageScore: string;
    registrationDate: string;
    lastActive: string;
    noStudents: string;
    searchStudent: string;
    filterByClass: string;
    exportResults: string;
    viewDetails: string;
    examHistory: string;
    performanceReport: string;
  };

  // Anti-cheat
  anticheat: {
    title: string;
    description: string;
    cameraRequired: string;
    faceDetected: string;
    noFaceDetected: string;
    multipleFaces: string;
    lookingAway: string;
    phoneDetected: string;
    headphonesDetected: string;
    suspiciousActivity: string;
    warningCount: string;
    maxWarningsReached: string;
    examTerminated: string;
    enableCamera: string;
    cameraPermissionDenied: string;
    faceVerification: string;
    verifyIdentity: string;
    identityVerified: string;
    identityMismatch: string;
    takeSelfie: string;
    retakeSelfie: string;
    processingImage: string;
    modelLoading: string;
    modelLoadError: string;
    detectionActive: string;
    detectionPaused: string;
    warning: string;
    violation: string;
  };

  // Results
  results: {
    examResults: string;
    studentResults: string;
    classResults: string;
    score: string;
    percentage: string;
    correctAnswers: string;
    incorrectAnswers: string;
    unanswered: string;
    timeTaken: string;
    submittedAt: string;
    attemptNumber: string;
    reviewAnswers: string;
    downloadReport: string;
    classAverage: string;
    highestScore: string;
    lowestScore: string;
    passRate: string;
    statistics: string;
    scoreDistribution: string;
  };

  // Settings
  settings: {
    language: string;
    vietnamese: string;
    english: string;
    theme: string;
    darkMode: string;
    lightMode: string;
    notifications: string;
    emailNotifications: string;
    pushNotifications: string;
    account: string;
    security: string;
    changePassword: string;
    twoFactorAuth: string;
    privacy: string;
    helpSupport: string;
    about: string;
    version: string;
    termsOfService: string;
    privacyPolicy: string;
  };

  // Profile
  profile: {
    editProfile: string;
    uploadPhoto: string;
    changePhoto: string;
    personalInfo: string;
    contactInfo: string;
    academicInfo: string;
    role: string;
    teacher: string;
    student: string;
    admin: string;
    department: string;
    joinedDate: string;
    bio: string;
    phone: string;
    address: string;
  };

  // Validation
  validation: {
    fieldRequired: string;
    invalidFormat: string;
    tooShort: string;
    tooLong: string;
    invalidNumber: string;
    minValue: string;
    maxValue: string;
    dateInPast: string;
    dateInFuture: string;
    endBeforeStart: string;
  };
}

export const translations: Record<Language, Translations> = {
  vi: {
    common: {
      loading: 'Đang tải...',
      error: 'Lỗi',
      success: 'Thành công',
      save: 'Lưu',
      cancel: 'Hủy',
      delete: 'Xóa',
      edit: 'Sửa',
      create: 'Tạo',
      search: 'Tìm kiếm',
      confirm: 'Xác nhận',
      back: 'Quay lại',
      next: 'Tiếp theo',
      submit: 'Nộp',
      close: 'Đóng',
      refresh: 'Làm mới',
      noData: 'Không có dữ liệu',
      required: 'Bắt buộc',
      optional: 'Tùy chọn',
      actions: 'Thao tác',
      yes: 'Có',
      no: 'Không',
      ok: 'OK',
    },

    auth: {
      login: 'Đăng nhập',
      signup: 'Đăng ký',
      logout: 'Đăng xuất',
      email: 'Email',
      password: 'Mật khẩu',
      confirmPassword: 'Xác nhận mật khẩu',
      username: 'Tên đăng nhập',
      fullName: 'Họ và tên',
      forgotPassword: 'Quên mật khẩu?',
      welcomeBack: 'Chào mừng trở lại',
      signInToContinue: 'Đăng nhập để tiếp tục',
      dontHaveAccount: 'Chưa có tài khoản?',
      alreadyHaveAccount: 'Đã có tài khoản?',
      signingIn: 'Đang đăng nhập...',
      signingUp: 'Đang đăng ký...',
      emailRequired: 'Vui lòng nhập địa chỉ email',
      passwordRequired: 'Vui lòng nhập mật khẩu',
      invalidCredentials: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra và thử lại.',
      emailAlreadyExists: 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.',
      weakPassword: 'Mật khẩu phải có ít nhất 6 ký tự.',
      networkError: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.',
      invalidEmail: 'Địa chỉ email không hợp lệ.',
      passwordMismatch: 'Mật khẩu xác nhận không khớp.',
      usernameRequired: 'Vui lòng nhập tên đăng nhập.',
      nameRequired: 'Vui lòng nhập họ và tên.',
      loginFailed: 'Đăng nhập thất bại',
      signupFailed: 'Đăng ký thất bại',
    },

    navigation: {
      dashboard: 'Tổng quan',
      exams: 'Đề thi',
      classes: 'Lớp học',
      students: 'Sinh viên',
      results: 'Kết quả',
      settings: 'Cài đặt',
      profile: 'Hồ sơ',
      anticheat: 'Chống gian lận',
    },

    exam: {
      createExam: 'Tạo đề thi',
      editExam: 'Sửa đề thi',
      examList: 'Danh sách đề thi',
      examTitle: 'Tên đề thi',
      examDescription: 'Mô tả đề thi',
      duration: 'Thời gian làm bài',
      durationMinutes: 'phút',
      startTime: 'Thời gian bắt đầu',
      endTime: 'Thời gian kết thúc',
      totalQuestions: 'Tổng số câu hỏi',
      totalPoints: 'Tổng điểm',
      passingScore: 'Điểm đạt',
      shuffleQuestions: 'Xáo trộn câu hỏi',
      shuffleAnswers: 'Xáo trộn đáp án',
      showResults: 'Hiển thị kết quả',
      allowReview: 'Cho phép xem lại',
      maxAttempts: 'Số lần làm tối đa',
      questions: 'Câu hỏi',
      addQuestion: 'Thêm câu hỏi',
      editQuestion: 'Sửa câu hỏi',
      deleteQuestion: 'Xóa câu hỏi',
      questionText: 'Nội dung câu hỏi',
      questionType: 'Loại câu hỏi',
      multipleChoice: 'Trắc nghiệm',
      trueFalse: 'Đúng/Sai',
      shortAnswer: 'Trả lời ngắn',
      essay: 'Tự luận',
      options: 'Các đáp án',
      addOption: 'Thêm đáp án',
      correctAnswer: 'Đáp án đúng',
      points: 'Điểm',
      explanation: 'Giải thích',
      questionNumber: 'Câu hỏi số',
      noQuestions: 'Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.',
      confirmDeleteQuestion: 'Bạn có chắc chắn muốn xóa câu hỏi này?',
      confirmDeleteExam: 'Bạn có chắc chắn muốn xóa đề thi này? Hành động này không thể hoàn tác.',
      examCreatedSuccess: 'Tạo đề thi thành công!',
      examUpdatedSuccess: 'Cập nhật đề thi thành công!',
      examDeletedSuccess: 'Xóa đề thi thành công!',
      questionAddedSuccess: 'Thêm câu hỏi thành công!',
      questionUpdatedSuccess: 'Cập nhật câu hỏi thành công!',
      questionDeletedSuccess: 'Xóa câu hỏi thành công!',
      startExam: 'Bắt đầu làm bài',
      submitExam: 'Nộp bài',
      timeRemaining: 'Thời gian còn lại',
      examInProgress: 'Đang làm bài',
      examCompleted: 'Hoàn thành',
      yourScore: 'Điểm của bạn',
      passed: 'Đạt',
      failed: 'Không đạt',
      assignToClass: 'Gán cho lớp học',
      previewExam: 'Xem trước đề thi',
      publishExam: 'Xuất bản đề thi',
      unpublishExam: 'Hủy xuất bản',
      draft: 'Bản nháp',
      published: 'Đã xuất bản',
      archived: 'Đã lưu trữ',
      enterExamTitle: 'Nhập tên đề thi',
      enterExamDescription: 'Nhập mô tả đề thi',
      enterQuestionText: 'Nhập nội dung câu hỏi',
      enterOptionText: 'Nhập nội dung đáp án',
      selectCorrectAnswer: 'Chọn đáp án đúng',
      enterPoints: 'Nhập điểm số',
      enterExplanation: 'Nhập giải thích (tùy chọn)',
      minOneOption: 'Phải có ít nhất 1 đáp án',
      minTwoOptions: 'Phải có ít nhất 2 đáp án',
      selectQuestionType: 'Chọn loại câu hỏi',
      invalidDuration: 'Thời gian làm bài không hợp lệ',
      invalidPoints: 'Điểm số không hợp lệ',
      examTitleRequired: 'Vui lòng nhập tên đề thi',
      durationRequired: 'Vui lòng nhập thời gian làm bài',
      loadExamError: 'Không thể tải đề thi',
      deleteExamError: 'Không thể xóa đề thi',
      deleteQuestionError: 'Không thể xóa câu hỏi',
      updateExamError: 'Không thể cập nhật đề thi',
    },

    class: {
      createClass: 'Tạo lớp học',
      editClass: 'Sửa lớp học',
      classList: 'Danh sách lớp học',
      className: 'Tên lớp học',
      classCode: 'Mã lớp',
      classDescription: 'Mô tả lớp học',
      instructor: 'Giảng viên',
      students: 'Sinh viên',
      addStudent: 'Thêm sinh viên',
      removeStudent: 'Xóa sinh viên',
      studentCount: 'Số sinh viên',
      examCount: 'Số đề thi',
      noClasses: 'Chưa có lớp học nào. Nhấn "Tạo lớp học" để bắt đầu.',
      noStudentsInClass: 'Chưa có sinh viên nào trong lớp học này.',
      confirmRemoveStudent: 'Bạn có chắc chắn muốn xóa sinh viên này khỏi lớp?',
      confirmDeleteClass: 'Bạn có chắc chắn muốn xóa lớp học này? Hành động này không thể hoàn tác.',
      classCreatedSuccess: 'Tạo lớp học thành công!',
      classUpdatedSuccess: 'Cập nhật lớp học thành công!',
      classDeletedSuccess: 'Xóa lớp học thành công!',
      studentAddedSuccess: 'Thêm sinh viên thành công!',
      studentRemovedSuccess: 'Xóa sinh viên thành công!',
      enterClassName: 'Nhập tên lớp học',
      enterClassCode: 'Nhập mã lớp',
      enterClassDescription: 'Nhập mô tả lớp học',
      classNameRequired: 'Vui lòng nhập tên lớp học',
      classCodeRequired: 'Vui lòng nhập mã lớp',
      viewStudents: 'Xem sinh viên',
      manageStudents: 'Quản lý sinh viên',
      assignExam: 'Gán đề thi',
      viewExams: 'Xem đề thi',
      classExams: 'Đề thi của lớp',
      classDetails: 'Chi tiết lớp học',
      joinClass: 'Tham gia lớp',
      leaveClass: 'Rời lớp',
      inviteStudents: 'Mời sinh viên',
      generateInviteCode: 'Tạo mã mời',
      inviteCode: 'Mã mời',
      copyCode: 'Sao chép mã',
      codeCopied: 'Đã sao chép mã!',
      searchStudentByEmail: 'Tìm sinh viên theo email',
      studentNotFound: 'Không tìm thấy sinh viên với email này',
      studentAlreadyInClass: 'Sinh viên đã có trong lớp học này',
      addingStudent: 'Đang thêm sinh viên...',
      addStudentError: 'Có lỗi xảy ra khi thêm sinh viên',
      addByEmail: 'Thêm theo email',
      addByCode: 'Thêm theo mã sinh viên',
      studentEmail: 'Email sinh viên',
      loadClassError: 'Không thể tải thông tin lớp học',
      deleteClassError: 'Không thể xóa lớp học',
      removeStudentError: 'Không thể xóa sinh viên khỏi lớp',
    },

    student: {
      studentList: 'Danh sách sinh viên',
      studentProfile: 'Hồ sơ sinh viên',
      studentId: 'Mã sinh viên',
      enrolledClasses: 'Lớp đã tham gia',
      completedExams: 'Đề thi đã hoàn thành',
      averageScore: 'Điểm trung bình',
      registrationDate: 'Ngày đăng ký',
      lastActive: 'Hoạt động lần cuối',
      noStudents: 'Chưa có sinh viên nào.',
      searchStudent: 'Tìm kiếm sinh viên',
      filterByClass: 'Lọc theo lớp',
      exportResults: 'Xuất kết quả',
      viewDetails: 'Xem chi tiết',
      examHistory: 'Lịch sử thi',
      performanceReport: 'Báo cáo thành tích',
    },

    anticheat: {
      title: 'Hệ thống chống gian lận',
      description: 'Giám sát thí sinh trong quá trình thi',
      cameraRequired: 'Yêu cầu bật camera để tiếp tục',
      faceDetected: 'Đã phát hiện khuôn mặt',
      noFaceDetected: 'Không phát hiện khuôn mặt! Vui lòng nhìn vào camera.',
      multipleFaces: 'Phát hiện nhiều khuôn mặt! Chỉ được phép có một người.',
      lookingAway: 'Phát hiện nhìn đi chỗ khác! Vui lòng nhìn vào màn hình.',
      phoneDetected: 'Phát hiện điện thoại! Vui lòng cất thiết bị đi.',
      headphonesDetected: 'Phát hiện tai nghe! Vui lòng tháo tai nghe ra.',
      suspiciousActivity: 'Phát hiện hoạt động đáng ngờ!',
      warningCount: 'Số lần cảnh báo',
      maxWarningsReached: 'Đã vượt quá số lần cảnh báo cho phép!',
      examTerminated: 'Bài thi đã bị hủy do vi phạm quy định.',
      enableCamera: 'Bật camera',
      cameraPermissionDenied: 'Quyền truy cập camera bị từ chối. Vui lòng cấp quyền trong cài đặt.',
      faceVerification: 'Xác minh khuôn mặt',
      verifyIdentity: 'Xác minh danh tính',
      identityVerified: 'Đã xác minh danh tính thành công!',
      identityMismatch: 'Danh tính không khớp! Vui lòng liên hệ giám thị.',
      takeSelfie: 'Chụp ảnh',
      retakeSelfie: 'Chụp lại',
      processingImage: 'Đang xử lý ảnh...',
      modelLoading: 'Đang tải mô hình AI...',
      modelLoadError: 'Không thể tải mô hình AI. Vui lòng thử lại.',
      detectionActive: 'Giám sát đang hoạt động',
      detectionPaused: 'Giám sát tạm dừng',
      warning: 'Cảnh báo',
      violation: 'Vi phạm',
    },

    results: {
      examResults: 'Kết quả thi',
      studentResults: 'Kết quả sinh viên',
      classResults: 'Kết quả lớp học',
      score: 'Điểm',
      percentage: 'Phần trăm',
      correctAnswers: 'Số câu đúng',
      incorrectAnswers: 'Số câu sai',
      unanswered: 'Chưa trả lời',
      timeTaken: 'Thời gian làm bài',
      submittedAt: 'Nộp lúc',
      attemptNumber: 'Lần làm bài',
      reviewAnswers: 'Xem lại đáp án',
      downloadReport: 'Tải báo cáo',
      classAverage: 'Điểm trung bình lớp',
      highestScore: 'Điểm cao nhất',
      lowestScore: 'Điểm thấp nhất',
      passRate: 'Tỷ lệ đạt',
      statistics: 'Thống kê',
      scoreDistribution: 'Phân bố điểm',
    },

    settings: {
      language: 'Ngôn ngữ',
      vietnamese: 'Tiếng Việt',
      english: 'English',
      theme: 'Giao diện',
      darkMode: 'Chế độ tối',
      lightMode: 'Chế độ sáng',
      notifications: 'Thông báo',
      emailNotifications: 'Thông báo email',
      pushNotifications: 'Thông báo đẩy',
      account: 'Tài khoản',
      security: 'Bảo mật',
      changePassword: 'Đổi mật khẩu',
      twoFactorAuth: 'Xác thực hai yếu tố',
      privacy: 'Quyền riêng tư',
      helpSupport: 'Trợ giúp & Hỗ trợ',
      about: 'Giới thiệu',
      version: 'Phiên bản',
      termsOfService: 'Điều khoản dịch vụ',
      privacyPolicy: 'Chính sách bảo mật',
    },

    profile: {
      editProfile: 'Sửa hồ sơ',
      uploadPhoto: 'Tải ảnh lên',
      changePhoto: 'Thay đổi ảnh',
      personalInfo: 'Thông tin cá nhân',
      contactInfo: 'Thông tin liên hệ',
      academicInfo: 'Thông tin học thuật',
      role: 'Vai trò',
      teacher: 'Giảng viên',
      student: 'Sinh viên',
      admin: 'Quản trị viên',
      department: 'Khoa',
      joinedDate: 'Ngày tham gia',
      bio: 'Tiểu sử',
      phone: 'Số điện thoại',
      address: 'Địa chỉ',
    },

    validation: {
      fieldRequired: 'Trường này là bắt buộc',
      invalidFormat: 'Định dạng không hợp lệ',
      tooShort: 'Quá ngắn',
      tooLong: 'Quá dài',
      invalidNumber: 'Số không hợp lệ',
      minValue: 'Giá trị tối thiểu là',
      maxValue: 'Giá trị tối đa là',
      dateInPast: 'Ngày không được trong quá khứ',
      dateInFuture: 'Ngày phải trong tương lai',
      endBeforeStart: 'Thời gian kết thúc phải sau thời gian bắt đầu',
    },
  },

  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      close: 'Close',
      refresh: 'Refresh',
      noData: 'No data',
      required: 'Required',
      optional: 'Optional',
      actions: 'Actions',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
    },

    auth: {
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      username: 'Username',
      fullName: 'Full Name',
      forgotPassword: 'Forgot Password?',
      welcomeBack: 'Welcome Back',
      signInToContinue: 'Sign in to continue',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      signingIn: 'Signing In...',
      signingUp: 'Signing Up...',
      emailRequired: 'Please enter your email address',
      passwordRequired: 'Please enter your password',
      invalidCredentials: 'Invalid email or password. Please check your credentials and try again.',
      emailAlreadyExists: 'This email is already registered. Please login or use a different email.',
      weakPassword: 'Password must be at least 6 characters long.',
      networkError: 'Network error. Please check your internet connection and try again.',
      invalidEmail: 'Invalid email address.',
      passwordMismatch: 'Passwords do not match.',
      usernameRequired: 'Please enter a username.',
      nameRequired: 'Please enter your full name.',
      loginFailed: 'Login Failed',
      signupFailed: 'Signup Failed',
    },

    navigation: {
      dashboard: 'Dashboard',
      exams: 'Exams',
      classes: 'Classes',
      students: 'Students',
      results: 'Results',
      settings: 'Settings',
      profile: 'Profile',
      anticheat: 'Anti-Cheat',
    },

    exam: {
      createExam: 'Create Exam',
      editExam: 'Edit Exam',
      examList: 'Exam List',
      examTitle: 'Exam Title',
      examDescription: 'Exam Description',
      duration: 'Duration',
      durationMinutes: 'minutes',
      startTime: 'Start Time',
      endTime: 'End Time',
      totalQuestions: 'Total Questions',
      totalPoints: 'Total Points',
      passingScore: 'Passing Score',
      shuffleQuestions: 'Shuffle Questions',
      shuffleAnswers: 'Shuffle Answers',
      showResults: 'Show Results',
      allowReview: 'Allow Review',
      maxAttempts: 'Max Attempts',
      questions: 'Questions',
      addQuestion: 'Add Question',
      editQuestion: 'Edit Question',
      deleteQuestion: 'Delete Question',
      questionText: 'Question Text',
      questionType: 'Question Type',
      multipleChoice: 'Multiple Choice',
      trueFalse: 'True/False',
      shortAnswer: 'Short Answer',
      essay: 'Essay',
      options: 'Options',
      addOption: 'Add Option',
      correctAnswer: 'Correct Answer',
      points: 'Points',
      explanation: 'Explanation',
      questionNumber: 'Question #',
      noQuestions: 'No questions yet. Click "Add Question" to start.',
      confirmDeleteQuestion: 'Are you sure you want to delete this question?',
      confirmDeleteExam: 'Are you sure you want to delete this exam? This action cannot be undone.',
      examCreatedSuccess: 'Exam created successfully!',
      examUpdatedSuccess: 'Exam updated successfully!',
      examDeletedSuccess: 'Exam deleted successfully!',
      questionAddedSuccess: 'Question added successfully!',
      questionUpdatedSuccess: 'Question updated successfully!',
      questionDeletedSuccess: 'Question deleted successfully!',
      startExam: 'Start Exam',
      submitExam: 'Submit Exam',
      timeRemaining: 'Time Remaining',
      examInProgress: 'Exam in Progress',
      examCompleted: 'Completed',
      yourScore: 'Your Score',
      passed: 'Passed',
      failed: 'Failed',
      assignToClass: 'Assign to Class',
      previewExam: 'Preview Exam',
      publishExam: 'Publish Exam',
      unpublishExam: 'Unpublish',
      draft: 'Draft',
      published: 'Published',
      archived: 'Archived',
      enterExamTitle: 'Enter exam title',
      enterExamDescription: 'Enter exam description',
      enterQuestionText: 'Enter question text',
      enterOptionText: 'Enter option text',
      selectCorrectAnswer: 'Select correct answer',
      enterPoints: 'Enter points',
      enterExplanation: 'Enter explanation (optional)',
      minOneOption: 'At least 1 option is required',
      minTwoOptions: 'At least 2 options are required',
      selectQuestionType: 'Select question type',
      invalidDuration: 'Invalid duration',
      invalidPoints: 'Invalid points',
      examTitleRequired: 'Please enter exam title',
      durationRequired: 'Please enter duration',
      loadExamError: 'Failed to load exam',
      deleteExamError: 'Failed to delete exam',
      deleteQuestionError: 'Failed to delete question',
      updateExamError: 'Failed to update exam',
    },

    class: {
      createClass: 'Create Class',
      editClass: 'Edit Class',
      classList: 'Class List',
      className: 'Class Name',
      classCode: 'Class Code',
      classDescription: 'Class Description',
      instructor: 'Instructor',
      students: 'Students',
      addStudent: 'Add Student',
      removeStudent: 'Remove Student',
      studentCount: 'Number of Students',
      examCount: 'Number of Exams',
      noClasses: 'No classes yet. Click "Create Class" to start.',
      noStudentsInClass: 'No students in this class yet.',
      confirmRemoveStudent: 'Are you sure you want to remove this student from the class?',
      confirmDeleteClass: 'Are you sure you want to delete this class? This action cannot be undone.',
      classCreatedSuccess: 'Class created successfully!',
      classUpdatedSuccess: 'Class updated successfully!',
      classDeletedSuccess: 'Class deleted successfully!',
      studentAddedSuccess: 'Student added successfully!',
      studentRemovedSuccess: 'Student removed successfully!',
      enterClassName: 'Enter class name',
      enterClassCode: 'Enter class code',
      enterClassDescription: 'Enter class description',
      classNameRequired: 'Please enter class name',
      classCodeRequired: 'Please enter class code',
      viewStudents: 'View Students',
      manageStudents: 'Manage Students',
      assignExam: 'Assign Exam',
      viewExams: 'View Exams',
      classExams: 'Class Exams',
      classDetails: 'Class Details',
      joinClass: 'Join Class',
      leaveClass: 'Leave Class',
      inviteStudents: 'Invite Students',
      generateInviteCode: 'Generate Invite Code',
      inviteCode: 'Invite Code',
      copyCode: 'Copy Code',
      codeCopied: 'Code copied!',
      searchStudentByEmail: 'Search student by email',
      studentNotFound: 'No student found with this email',
      studentAlreadyInClass: 'Student is already in this class',
      addingStudent: 'Adding student...',
      addStudentError: 'An error occurred while adding student',
      addByEmail: 'Add by Email',
      addByCode: 'Add by Student ID',
      studentEmail: 'Student Email',
      loadClassError: 'Failed to load class',
      deleteClassError: 'Failed to delete class',
      removeStudentError: 'Failed to remove student',
    },

    student: {
      studentList: 'Student List',
      studentProfile: 'Student Profile',
      studentId: 'Student ID',
      enrolledClasses: 'Enrolled Classes',
      completedExams: 'Completed Exams',
      averageScore: 'Average Score',
      registrationDate: 'Registration Date',
      lastActive: 'Last Active',
      noStudents: 'No students yet.',
      searchStudent: 'Search Student',
      filterByClass: 'Filter by Class',
      exportResults: 'Export Results',
      viewDetails: 'View Details',
      examHistory: 'Exam History',
      performanceReport: 'Performance Report',
    },

    anticheat: {
      title: 'Anti-Cheat System',
      description: 'Monitoring students during exams',
      cameraRequired: 'Camera is required to continue',
      faceDetected: 'Face detected',
      noFaceDetected: 'No face detected! Please look at the camera.',
      multipleFaces: 'Multiple faces detected! Only one person is allowed.',
      lookingAway: 'Looking away detected! Please look at the screen.',
      phoneDetected: 'Phone detected! Please put away your device.',
      headphonesDetected: 'Headphones detected! Please remove your headphones.',
      suspiciousActivity: 'Suspicious activity detected!',
      warningCount: 'Warning count',
      maxWarningsReached: 'Maximum warnings exceeded!',
      examTerminated: 'Exam has been terminated due to violations.',
      enableCamera: 'Enable Camera',
      cameraPermissionDenied: 'Camera permission denied. Please grant permission in settings.',
      faceVerification: 'Face Verification',
      verifyIdentity: 'Verify Identity',
      identityVerified: 'Identity verified successfully!',
      identityMismatch: 'Identity mismatch! Please contact the proctor.',
      takeSelfie: 'Take Photo',
      retakeSelfie: 'Retake Photo',
      processingImage: 'Processing image...',
      modelLoading: 'Loading AI model...',
      modelLoadError: 'Failed to load AI model. Please try again.',
      detectionActive: 'Monitoring active',
      detectionPaused: 'Monitoring paused',
      warning: 'Warning',
      violation: 'Violation',
    },

    results: {
      examResults: 'Exam Results',
      studentResults: 'Student Results',
      classResults: 'Class Results',
      score: 'Score',
      percentage: 'Percentage',
      correctAnswers: 'Correct Answers',
      incorrectAnswers: 'Incorrect Answers',
      unanswered: 'Unanswered',
      timeTaken: 'Time Taken',
      submittedAt: 'Submitted At',
      attemptNumber: 'Attempt #',
      reviewAnswers: 'Review Answers',
      downloadReport: 'Download Report',
      classAverage: 'Class Average',
      highestScore: 'Highest Score',
      lowestScore: 'Lowest Score',
      passRate: 'Pass Rate',
      statistics: 'Statistics',
      scoreDistribution: 'Score Distribution',
    },

    settings: {
      language: 'Language',
      vietnamese: 'Vietnamese',
      english: 'English',
      theme: 'Theme',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      notifications: 'Notifications',
      emailNotifications: 'Email Notifications',
      pushNotifications: 'Push Notifications',
      account: 'Account',
      security: 'Security',
      changePassword: 'Change Password',
      twoFactorAuth: 'Two-Factor Authentication',
      privacy: 'Privacy',
      helpSupport: 'Help & Support',
      about: 'About',
      version: 'Version',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
    },

    profile: {
      editProfile: 'Edit Profile',
      uploadPhoto: 'Upload Photo',
      changePhoto: 'Change Photo',
      personalInfo: 'Personal Information',
      contactInfo: 'Contact Information',
      academicInfo: 'Academic Information',
      role: 'Role',
      teacher: 'Teacher',
      student: 'Student',
      admin: 'Admin',
      department: 'Department',
      joinedDate: 'Joined Date',
      bio: 'Bio',
      phone: 'Phone',
      address: 'Address',
    },

    validation: {
      fieldRequired: 'This field is required',
      invalidFormat: 'Invalid format',
      tooShort: 'Too short',
      tooLong: 'Too long',
      invalidNumber: 'Invalid number',
      minValue: 'Minimum value is',
      maxValue: 'Maximum value is',
      dateInPast: 'Date cannot be in the past',
      dateInFuture: 'Date must be in the future',
      endBeforeStart: 'End time must be after start time',
    },
  },
};
