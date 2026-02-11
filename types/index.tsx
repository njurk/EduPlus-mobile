export interface User {
    id: number;
    email: string;
    name: string;
    roleLevel: number;
    studentName?: string;
}

export interface BackendLoginResponse {
    token: string;
    userId: number;
    userEmail: string;
    userName: string;
    maxRoleLevel: number;
    studentName?: string;
}

export type LoginCredentials = { email: string; password: string };

export interface MobileLessonDto {
    dayOfWeek: number;
    orderNumber: number;
    startTime: string;
    endTime: string;
    subjectName: string;
    teacherName: string;
    classroomName: string;
}

export interface MobileScheduleDto {
    classId: number;
    className: string;
    semesterId: number;
    semesterName: string;
    lessons: MobileLessonDto[];
}

export interface MobileGradeDto {
    id: number;
    value: string;
    categoryName: string;
    categoryColorHex: string;
    teacherName: string;
    comment: string | null;
    weight: number;
    createdAt: string;
}

export interface MobileSubjectGradesDto {
    subjectId: number;
    subjectName: string;
    average: number | null;
    grades: MobileGradeDto[];
}

export interface MobileRecentGradeDto {
    id: number;
    subjectName: string;
    value: string;
    categoryName: string;
    categoryColorHex: string;
    teacherName: string;
    comment: string | null;
    weight: number;
    date: string;
    createdAt: string;
}

export interface MobileGradesDto {
    subjects: MobileSubjectGradesDto[];
    recentGrades: MobileRecentGradeDto[];
}

export interface MobileSubjectAttendanceDto {
    subjectName: string;
    totalLessons: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendancePercentage: number;
}

export interface MobileAttendanceRecordDto {
    subjectName: string;
    date: string;
    type: string;
    typeColorHex: string;
}

export interface MobileDailyLessonDto {
    lessonOrder: number;
    startTime: string;
    endTime: string;
    subjectName: string;
    attendanceType: string | null;
    attendanceTypeColorHex: string | null;
}

export interface MobileAttendanceStatDto {
    shortCode: string;
    name: string;
    colorHex: string;
    count: number;
    isNegative: boolean;
}

export interface MobileAttendanceDto {
    subjects: MobileSubjectAttendanceDto[];
    recentRecords: MobileAttendanceRecordDto[];
    dailyLessons: MobileDailyLessonDto[];
    stats: MobileAttendanceStatDto[];
    totalLessons: number;
}

export interface MobileAnnouncementDto {
    id: number;
    title: string;
    content: string;
    authorName: string;
    createdAt: string;
    updatedAt: string | null;
    isRead: boolean;
}

export interface MobileNegativeAttendanceDto {
    id: number;
    date: string;
    subjectName: string;
    lessonHour: number;
    attendanceType: string;
    attendanceTypeColorHex: string;
}

export interface CreateMobileExcuseDto {
    attendanceIds: number[];
    reason: string;
}

export interface MobileSemesterDto {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
}

export interface MobileChildDto {
    id: number;
    name: string;
    className: string | null;
}

export interface MobileExcuseAttendanceDto {
    id: number;
    subjectName: string;
    date: string;
    lessonHour: number;
    attendanceType: string;
}

export interface MobileExcuseDto {
    id: number;
    reason: string;
    status: string;
    statusColorHex: string;
    createdAt: string;
    attendances: MobileExcuseAttendanceDto[];
}

export interface TicketReason {
    id: number;
    name: string;
}

export interface CMSContent {
    key: string;
    value: string;
}

export interface UserProfile {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    street: string | null;
    city: string | null;
    postalCode: string | null;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
