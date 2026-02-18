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

export interface MobileLesson {
    dayOfWeek: number;
    orderNumber: number;
    startTime: string;
    endTime: string;
    subjectName: string;
    teacherName: string;
    classroomName: string;
}

export interface MobileSchedule {
    classId: number;
    className: string;
    semesterId: number;
    semesterName: string;
    lessons: MobileLesson[];
}

export interface MobileGrade {
    id: number;
    value: string;
    categoryName: string;
    categoryColorHex: string;
    categorySlug: string | null;
    teacherName: string;
    comment: string | null;
    weight: number;
    createdAt: string;
}

export interface MobileSubjectGrades {
    subjectId: number;
    subjectName: string;
    average: number | null;
    grades: MobileGrade[];
}

export interface MobileRecentGrade {
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

export interface MobileGrades {
    subjects: MobileSubjectGrades[];
    recentGrades: MobileRecentGrade[];
}

export interface MobileSubjectAttendance {
    subjectName: string;
    totalLessons: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendancePercentage: number;
}

export interface MobileAttendanceRecord {
    subjectName: string;
    date: string;
    type: string;
    typeColorHex: string;
}

export interface MobileDailyLesson {
    lessonOrder: number;
    startTime: string;
    endTime: string;
    subjectName: string;
    attendanceType: string | null;
    attendanceTypeColorHex: string | null;
}

export interface MobileAttendanceStat {
    shortCode: string;
    name: string;
    colorHex: string;
    count: number;
    isNegative: boolean;
}

export interface MobileAttendance {
    subjects: MobileSubjectAttendance[];
    recentRecords: MobileAttendanceRecord[];
    dailyLessons: MobileDailyLesson[];
    stats: MobileAttendanceStat[];
    totalLessons: number;
}

export interface MobileAnnouncement {
    id: number;
    title: string;
    content: string;
    authorName: string;
    createdAt: string;
    updatedAt: string | null;
    isRead: boolean;
}

export interface MobileNegativeAttendance {
    id: number;
    date: string;
    subjectName: string;
    lessonHour: number;
    attendanceType: string;
    attendanceTypeColorHex: string;
}

export interface CreateMobileExcuse {
    attendanceIds: number[];
    reason: string;
}

export interface MobileSemester {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
}

export interface MobileChild {
    id: number;
    name: string;
    className: string | null;
}

export interface MobileExcuseAttendance {
    id: number;
    subjectName: string;
    date: string;
    lessonHour: number;
    attendanceType: string;
    attendanceTypeColorHex: string;
}

export interface MobileExcuse {
    id: number;
    reason: string;
    status: string;
    statusColorHex: string;
    createdAt: string;
    attendances: MobileExcuseAttendance[];
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

export interface ChangePassword {
    currentPassword: string;
    newPassword: string;
}
