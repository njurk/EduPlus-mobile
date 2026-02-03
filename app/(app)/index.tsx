import { GlobalStyles } from '@/constants/styles';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { MobileAnnouncementDto, mobileApi, MobileSubjectGradesDto } from '@/services/api';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DashboardScreen() {
    const { user, logout } = useAuth();
    const [recentGrades, setRecentGrades] = useState<MobileSubjectGradesDto[]>([]);
    const [unreadAnnouncements, setUnreadAnnouncements] = useState<MobileAnnouncementDto[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const [gradesData, announcementsData] = await Promise.all([
                mobileApi.getGrades(),
                mobileApi.getAnnouncements(),
            ]);
            setRecentGrades(gradesData.subjects.slice(0, 3));
            setUnreadAnnouncements(announcementsData.filter(a => !a.isRead).slice(0, 3));
        } catch { }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    return (
        <ScrollView
            style={GlobalStyles.screen}
            contentContainerStyle={GlobalStyles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.DEFAULT]} />}
        >
            <View style={[GlobalStyles.rowBetween, { marginBottom: Spacing[6] }]}>
                <Text style={GlobalStyles.headerLarge}>Cześć, {user?.firstName}!</Text>
                <TouchableOpacity onPress={logout} style={GlobalStyles.buttonDanger}>
                    <Text style={GlobalStyles.buttonDangerText}>Wyloguj</Text>
                </TouchableOpacity>
            </View>

            <View style={GlobalStyles.card}>
                <Text style={GlobalStyles.cardTitle}>Ostatnie oceny</Text>
                {recentGrades.length === 0 ? (
                    <Text style={GlobalStyles.emptyText}>Brak ocen do wyświetlenia</Text>
                ) : (
                    recentGrades.map((subject, index) => (
                        <View key={index} style={[GlobalStyles.rowBetween, GlobalStyles.divider]}>
                            <Text style={GlobalStyles.subtitle}>{subject.subjectName}</Text>
                            <View style={GlobalStyles.rowWrap}>
                                {subject.grades.slice(0, 3).map((grade, gIndex) => (
                                    <View
                                        key={gIndex}
                                        style={[GlobalStyles.gradeBoxSmall, { backgroundColor: grade.categoryColorHex || Colors.neutral[200] }]}
                                    >
                                        <Text style={GlobalStyles.gradeValueSmall}>{grade.value}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))
                )}
            </View>

            <View style={GlobalStyles.card}>
                <Text style={GlobalStyles.cardTitle}>Nieprzeczytane ogłoszenia</Text>
                {unreadAnnouncements.length === 0 ? (
                    <Text style={GlobalStyles.emptyText}>Brak nowych ogłoszeń</Text>
                ) : (
                    unreadAnnouncements.map((announcement) => (
                        <View key={announcement.id} style={[GlobalStyles.row, GlobalStyles.divider, { gap: Spacing[2] }]}>
                            <View style={GlobalStyles.badge}>
                                <Text style={GlobalStyles.badgeText}>nowe</Text>
                            </View>
                            <Text style={GlobalStyles.subtitle} numberOfLines={1}>
                                {announcement.title}
                            </Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}
