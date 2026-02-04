import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const BASE_URL = 'http://192.168.88.89:5107';
export const API_URL = `${BASE_URL}/api`;

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface User {
    id: number;
    email: string;
    name: string;
    roleLevel: number;
}

interface BackendLoginResponse {
    token: string;
    userId: number;
    userEmail: string;
    userName: string;
    maxRoleLevel: number;
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

export interface MobileAttendanceDto {
    subjects: MobileSubjectAttendanceDto[];
    recentRecords: MobileAttendanceRecordDto[];
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
    if (typeof token !== 'string' || !token) {
        throw new Error('Token jest nieprawidłowy');
    }
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
    if (!user) return;
    const json = JSON.stringify(user);
    if (typeof json !== 'string' || !json) {
        throw new Error('Nie udało się zapisać użytkownika');
    }
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

let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
    onUnauthorizedCallback = callback;
}

async function handleResponse<T>(response: Response): Promise<T | null> {
    if (response.status === 401) {
        await removeToken();
        await removeUser();
        if (onUnauthorizedCallback) {
            onUnauthorizedCallback();
        }
        throw new Error('Sesja wygasła. Zaloguj się ponownie.');
    }
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

export const authApi = {
    async loginMobile(email: string, password: string): Promise<{ token: string; user: User }> {
        const response = await fetch(`${API_URL}/auth/login/mobile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Nieprawidłowy email lub hasło');
        }
        const text = await response.text();
        const data: BackendLoginResponse | null = text ? JSON.parse(text) : null;
        if (!data) throw new Error('Nieprawidłowa odpowiedź serwera');
        const tokenString = typeof data.token === 'string' ? data.token : String(data.token);
        const user: User = {
            id: data.userId,
            email: data.userEmail,
            name: data.userName,
            roleLevel: data.maxRoleLevel,
        };
        await storeToken(tokenString);
        await storeUser(user);
        return { token: tokenString, user };
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
        return data ?? { subjects: [], recentGrades: [] };
    },

    async getAttendance(semesterId?: number): Promise<MobileAttendanceDto> {
        const headers = await getHeaders();
        const params = semesterId ? `?semesterId=${semesterId}` : '';
        const response = await fetch(`${API_URL}/mobile/attendance${params}`, { headers });
        const data = await handleResponse<MobileAttendanceDto>(response);
        return data ?? { subjects: [], recentRecords: [] };
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

export const usersApi = {
    async get(id: number): Promise<UserProfile> {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/user/${id}`, { headers });
        const data = await handleResponse<UserProfile>(response);
        if (!data) throw new Error('Nie udało się pobrać danych użytkownika');
        return data;
    },

    async update(id: number, data: Partial<UserProfile>): Promise<void> {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/user/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });
        await handleResponse(response);
    },

    async changePassword(id: number, data: ChangePasswordDto): Promise<void> {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/user/${id}/change-password`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        await handleResponse(response);
    },
};
