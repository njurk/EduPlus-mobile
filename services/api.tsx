import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const API_URL = 'http://10.0.2.2:5107/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roleLevel: number;
}

export interface LoginResponse {
    token: string;
    user: User;
}

interface MobileLessonDto {
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

interface MobileGradeDto {
    value: string;
    categoryName: string;
    categoryColorHex: string;
    teacherName: string;
    comment: string | null;
    createdAt: string;
}

export interface MobileSubjectGradesDto {
    subjectId: number;
    subjectName: string;
    average: number | null;
    grades: MobileGradeDto[];
}

export interface MobileGradesDto {
    subjects: MobileSubjectGradesDto[];
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

export interface MobileAttendanceDto {
    subjects: MobileSubjectAttendanceDto[];
}

export interface MobileAnnouncementDto {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    isRead: boolean;
}

async function getStoredToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
}

async function storeToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
        return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function removeToken(): Promise<void> {
    if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
        return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function storeUser(user: User): Promise<void> {
    const json = JSON.stringify(user);
    if (Platform.OS === 'web') {
        localStorage.setItem(USER_KEY, json);
        return;
    }
    await SecureStore.setItemAsync(USER_KEY, json);
}

async function getStoredUser(): Promise<User | null> {
    let json: string | null;
    if (Platform.OS === 'web') {
        json = localStorage.getItem(USER_KEY);
    } else {
        json = await SecureStore.getItemAsync(USER_KEY);
    }
    if (!json) return null;
    return JSON.parse(json);
}

async function removeUser(): Promise<void> {
    if (Platform.OS === 'web') {
        localStorage.removeItem(USER_KEY);
        return;
    }
    await SecureStore.deleteItemAsync(USER_KEY);
}

async function getHeaders(): Promise<Record<string, string>> {
    const token = await getStoredToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse<T>(response: Response): Promise<T | null> {
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

export const authApi = {
    async loginMobile(email: string, password: string): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/auth/login/mobile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await handleResponse<LoginResponse>(response);
        if (!data) throw new Error('Nieprawidłowa odpowiedź serwera');
        await storeToken(data.token);
        await storeUser(data.user);
        return data;
    },

    async logout(): Promise<void> {
        const headers = await getHeaders();
        try {
            await fetch(`${API_URL}/auth/logout`, { method: 'POST', headers });
        } catch { }
        await removeToken();
        await removeUser();
    },

    async requestPasswordReset(email: string): Promise<void> {
        const response = await fetch(`${API_URL}/passwordreset/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        await handleResponse(response);
    },

    getStoredToken,
    getStoredUser,
    storeToken,
    storeUser,
    removeToken,
    removeUser,
};

export const mobileApi = {
    async getSchedule(): Promise<MobileScheduleDto | null> {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/mobile/schedule`, { headers });
        if (response.status === 404) return null;
        return handleResponse<MobileScheduleDto>(response);
    },

    async getGrades(semesterId?: number): Promise<MobileGradesDto> {
        const headers = await getHeaders();
        const params = semesterId ? `?semesterId=${semesterId}` : '';
        const response = await fetch(`${API_URL}/mobile/grades${params}`, { headers });
        const data = await handleResponse<MobileGradesDto>(response);
        return data ?? { subjects: [] };
    },

    async getAttendance(semesterId?: number): Promise<MobileAttendanceDto> {
        const headers = await getHeaders();
        const params = semesterId ? `?semesterId=${semesterId}` : '';
        const response = await fetch(`${API_URL}/mobile/attendance${params}`, { headers });
        const data = await handleResponse<MobileAttendanceDto>(response);
        return data ?? { subjects: [] };
    },

    async getAnnouncements(): Promise<MobileAnnouncementDto[]> {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/mobile/announcements`, { headers });
        const data = await handleResponse<MobileAnnouncementDto[]>(response);
        return data ?? [];
    },
};

export const announcementsApi = {
    async markAsRead(id: number): Promise<void> {
        const headers = await getHeaders();
        await fetch(`${API_URL}/announcement/${id}/read`, { method: 'POST', headers });
    },
};

export interface TicketReason {
    id: number;
    name: string;
}

export const ticketsApi = {
    async getReasons(): Promise<TicketReason[]> {
        const response = await fetch(`${API_URL}/ticketreason/active`, {
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await handleResponse<TicketReason[]>(response);
        return data ?? [];
    },

    async createAnonymous(data: { email: string; content: string; reasonId: number }): Promise<void> {
        const response = await fetch(`${API_URL}/ticket`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        await handleResponse(response);
    },
};

export interface CMSContent {
    key: string;
    value: string;
}

export const cmsApi = {
    async getPublicContent(pageLabel: string): Promise<Record<string, string>> {
        const response = await fetch(`${API_URL}/pagecontent/by-label/${pageLabel}`, {
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await handleResponse<CMSContent[]>(response);
        if (!data) return {};
        return data.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
        }, {} as Record<string, string>);
    },
};
