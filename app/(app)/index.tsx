import StatusBadge from '@/components/StatusBadge';
import StudentPicker from '@/components/StudentPicker';
import { GlobalStyles } from '@/constants/styles';
import { DAY_NAMES_FULL } from '@/constants/locale';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useStudent } from '@/contexts/StudentContext';
import { useCMSContent } from '@/hooks/useCMSContent';
import { announcementsApi, attendanceApi, gradesApi, scheduleApi } from '@/services/api';
import type { MobileAnnouncement, MobileAttendanceRecord, MobileRecentGrade, MobileSchedule } from '@/types';
import { useRefresh } from '@/hooks/useRefresh';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function DashboardScreen() {
    const { user } = useAuth();
    const { selectedStudent, hasMultipleChildren } = useStudent();
    const { getText } = useCMSContent('mobileDashboard');
    const [recentGrades, setRecentGrades] = useState<MobileRecentGrade[]>([]);
    const [announcements, setAnnouncements] = useState<MobileAnnouncement[]>([]);
    const [todayLessons, setTodayLessons] = useState<MobileSchedule['lessons']>([]);
    const [recentAttendance, setRecentAttendance] = useState<MobileAttendanceRecord[]>([]);

    const [className, setClassName] = useState<string | null>(null);

    const loadData = async () => {
        try {
            const studentId = selectedStudent?.id;
            const [gradesData, announcementsData, scheduleData, attendanceData] = await Promise.all([
                gradesApi.getAll(studentId),
                announcementsApi.getAll(),
                scheduleApi.get(studentId),
                attendanceApi.getAll(studentId),
            ]);

            setRecentGrades(gradesData?.recentGrades?.slice(0, 3) || []);
            setAnnouncements(announcementsData?.slice(0, 3) || []);

            const today = new Date().getDay();
            const todaySchedule = scheduleData?.lessons?.filter(l => l.dayOfWeek === today) || [];
            todaySchedule.sort((a, b) => a.orderNumber - b.orderNumber);
            setTodayLessons(todaySchedule);
            setClassName(selectedStudent?.className || scheduleData?.className || null);

            setRecentAttendance(attendanceData?.recentRecords?.slice(0, 3) || []);
        } catch (error) {
            console.error('dashboard error:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [selectedStudent])
    );

    const { refreshControl } = useRefresh(loadData);

    return (
        <ScrollView
            style={GlobalStyles.screen}
            contentContainerStyle={GlobalStyles.scrollContent}
            refreshControl={refreshControl}
        >
            <View style={{ marginBottom: Spacing[6] }}>
                <Text style={GlobalStyles.headerLarge}>{getText('greeting').replace('{name}', user?.name || '')}</Text>
                {hasMultipleChildren ? (
                    <StudentPicker />
                ) : user?.studentName && (
                    <Text style={[GlobalStyles.subtitle, { marginTop: Spacing[2] }]}>{getText('studentLabel')} {user.studentName}</Text>
                )}
                {className && (
                    <Text style={[GlobalStyles.subtitle, { marginTop: Spacing[2] }]}>Klasa: {className}</Text>
                )}
            </View>

            <View style={GlobalStyles.card}>
                <Text style={GlobalStyles.cardTitle}>{getText('lessonsToday').replace('{day}', DAY_NAMES_FULL[new Date().getDay()])}</Text>
                {todayLessons.length === 0 ? (
                    <Text style={GlobalStyles.emptyText}>Brak</Text>
                ) : (
                    todayLessons.map((lesson, index) => (
                        <View key={index} style={[GlobalStyles.rowBetween, GlobalStyles.divider]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}>
                                <Text style={{ fontSize: FontSizes.sm, color: Colors.neutral[500], minWidth: 85 }}>
                                    {lesson.startTime} - {lesson.endTime}
                                </Text>
                                <Text style={GlobalStyles.subtitle}>{lesson.subjectName}</Text>
                            </View>
                            <Text style={{ fontSize: FontSizes.xs, color: Colors.neutral[400] }}>{lesson.classroomName}</Text>
                        </View>
                    ))
                )}
            </View>

            <View style={GlobalStyles.card}>
                <Text style={GlobalStyles.cardTitle}>{getText('recentGrades')}</Text>
                {recentGrades.length === 0 ? (
                    <Text style={GlobalStyles.emptyText}>Brak</Text>
                ) : (
                    recentGrades.map((grade, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[GlobalStyles.rowBetween, GlobalStyles.divider]}
                            onPress={() => router.push({ pathname: '/(app)/grades', params: { openGradeId: grade.id } })}
                            activeOpacity={0.7}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}>
                                <View style={[GlobalStyles.gradeBox, { backgroundColor: grade.categoryColorHex || Colors.neutral[200] }]}>
                                    <Text style={GlobalStyles.gradeValue}>{grade.value}</Text>
                                </View>
                                <Text style={GlobalStyles.subtitle}>{grade.subjectName}</Text>
                            </View>
                            <Text style={{ fontSize: FontSizes.xs, color: Colors.neutral[400] }}>{grade.date}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </View>

            <View style={GlobalStyles.card}>
                <Text style={GlobalStyles.cardTitle}>{getText('recentAttendance')}</Text>
                {recentAttendance.length === 0 ? (
                    <Text style={GlobalStyles.emptyText}>Brak</Text>
                ) : (
                    recentAttendance.map((record, index) => (
                        <View key={index} style={[GlobalStyles.rowBetween, GlobalStyles.divider]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}>
                                <StatusBadge label={record.type} color={record.typeColorHex || Colors.neutral[200]} />
                                <Text style={GlobalStyles.subtitle}>{record.subjectName}</Text>
                            </View>
                            <Text style={{ fontSize: FontSizes.xs, color: Colors.neutral[400] }}>{record.date}</Text>
                        </View>
                    ))
                )}
            </View>

            <View style={GlobalStyles.card}>
                <Text style={GlobalStyles.cardTitle}>{getText('recentAnnouncements')}</Text>
                {announcements.length === 0 ? (
                    <Text style={GlobalStyles.emptyText}>Brak</Text>
                ) : (
                    announcements.map((announcement) => (
                        <TouchableOpacity
                            key={announcement.id}
                            style={[GlobalStyles.rowBetween, GlobalStyles.divider]}
                            onPress={() => router.push({ pathname: '/(app)/announcements', params: { openId: announcement.id } })}
                            activeOpacity={0.7}
                        >
                            <View style={[GlobalStyles.row, { gap: Spacing[2], flex: 1 }]}>
                                {!announcement.isRead && (
                                    <View style={GlobalStyles.badge}>
                                        <Text style={GlobalStyles.badgeText}>nowe</Text>
                                    </View>
                                )}
                                <Text style={[GlobalStyles.subtitle, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
                                    {announcement.title}
                                </Text>
                            </View>
                            <Text style={{ fontSize: FontSizes.xs, color: Colors.neutral[400] }}>
                                {new Date(announcement.createdAt).toLocaleDateString('pl-PL')}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </View>
        </ScrollView>
    );
}
