import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const BASE_URL = 'http://192.168.88.89:5107';
export const API_URL = `${BASE_URL}/api`;

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

import type {
    BackendLoginResponse, ChangePasswordDto, CMSContent,
    CreateMobileExcuseDto, MobileAnnouncementDto, MobileAttendanceDto,
    MobileChildDto, MobileExcuseDto, MobileGradesDto,
    MobileNegativeAttendanceDto, MobileScheduleDto, MobileSemesterDto,
    TicketReason, User, UserProfile
} from '@/types';

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

type QueryParams = Record<string, string | number | Date | undefined>;

function buildQuery(params?: QueryParams): string {
    if (!params) return '';
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined) continue;
        if (v instanceof Date) {
            sp.append(k, `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`);
        } else {
            sp.append(k, String(v));
        }
    }
    const qs = sp.toString();
    return qs ? `?${qs}` : '';
}

async function api<T>(method: string, path: string, opts?: { body?: unknown; params?: QueryParams }): Promise<T | null> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${path}${buildQuery(opts?.params)}`, {
        method,
        headers,
        ...(opts?.body !== undefined && { body: JSON.stringify(opts.body) }),
    });
    return handleResponse<T>(response);
}

async function publicApi<T>(path: string, body?: unknown): Promise<T | null> {
    const response = await fetch(`${API_URL}${path}`, {
        ...(body !== undefined && { method: 'POST', body: JSON.stringify(body) }),
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<T>(response);
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
            studentName: data.studentName,
        };
        await storeToken(tokenString);
        await storeUser(user);
        return { token: tokenString, user };
    },

    async logout(): Promise<void> {
        try {
            await api('POST', '/auth/logout');
        } catch { }
        await removeToken();
        await removeUser();
    },

    async requestPasswordReset(email: string): Promise<void> {
        await publicApi('/passwordreset/request', { email });
    },

    getStoredToken,
    getStoredUser,
};

export const studentsApi = {
    async getAll(): Promise<MobileChildDto[]> {
        return (await api<MobileChildDto[]>('GET', '/mobile/children')) ?? [];
    },
};

export const scheduleApi = {
    async get(studentId?: number): Promise<MobileScheduleDto | null> {
        const headers = await getHeaders();
        const response = await fetch(`${API_URL}/mobile/schedule${buildQuery({ studentId })}`, { headers });
        if (response.status === 404) return null;
        return handleResponse<MobileScheduleDto>(response);
    },
};

export const gradesApi = {
    async getAll(studentId?: number, semesterId?: number): Promise<MobileGradesDto> {
        return (await api<MobileGradesDto>('GET', '/mobile/grades', { params: { studentId, semesterId } })) ?? { subjects: [], recentGrades: [] };
    },
};

export const attendanceApi = {
    async getAll(studentId?: number, semesterId?: number, date?: Date): Promise<MobileAttendanceDto> {
        return (await api<MobileAttendanceDto>('GET', '/mobile/attendance', { params: { studentId, semesterId, date } })) ?? { subjects: [], recentRecords: [], dailyLessons: [], stats: [], totalLessons: 0 };
    },

    async getNegative(studentId?: number, semesterId?: number): Promise<MobileNegativeAttendanceDto[]> {
        return (await api<MobileNegativeAttendanceDto[]>('GET', '/mobile/negative-attendances', { params: { studentId, semesterId } })) ?? [];
    },
};

export const announcementsApi = {
    async getAll(): Promise<MobileAnnouncementDto[]> {
        return (await api<MobileAnnouncementDto[]>('GET', '/mobile/announcements')) ?? [];
    },

    async markAsRead(id: number): Promise<void> {
        await api('POST', `/announcement/${id}/read`);
    },
};

export const excusesApi = {
    async getAll(studentId?: number, semesterId?: number): Promise<MobileExcuseDto[]> {
        return (await api<MobileExcuseDto[]>('GET', '/mobile/excuses', { params: { studentId, semesterId } })) ?? [];
    },

    async create(studentId: number | undefined, dto: CreateMobileExcuseDto): Promise<void> {
        await api('POST', '/mobile/excuse', { body: dto, params: { studentId } });
    },
};

export const semestersApi = {
    async getAll(): Promise<MobileSemesterDto[]> {
        return (await api<MobileSemesterDto[]>('GET', '/mobile/semesters')) ?? [];
    },
};

export const ticketsApi = {
    async getReasons(): Promise<TicketReason[]> {
        return (await publicApi<TicketReason[]>('/ticketreason/active')) ?? [];
    },

    async createAnonymous(data: { email: string; content: string; reasonId: number }): Promise<void> {
        await publicApi('/ticket', data);
    },
};

export const cmsApi = {
    async getPublicContent(pageLabel: string): Promise<Record<string, string>> {
        const data = await publicApi<CMSContent[]>(`/pagecontent/by-label/${pageLabel}`);
        if (!data) return {};
        return data.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
        }, {} as Record<string, string>);
    },
};

export const usersApi = {
    async get(id: number): Promise<UserProfile> {
        const data = await api<UserProfile>('GET', `/user/${id}`);
        if (!data) throw new Error('Nie udało się pobrać danych użytkownika');
        return data;
    },

    async update(id: number, data: Partial<UserProfile>): Promise<void> {
        await api('PUT', `/user/${id}`, { body: data });
    },

    async changePassword(id: number, data: ChangePasswordDto): Promise<void> {
        await api('PATCH', `/user/${id}/change-password`, { body: data });
    },
};
