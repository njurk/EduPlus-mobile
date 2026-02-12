import { GlobalStyles } from '@/constants/styles';
import { Spacing } from '@/constants/theme';
import { useRefresh } from '@/hooks/useRefresh';
import { announcementsApi } from '@/services/api';
import type { MobileAnnouncement } from '@/types';
import { formatDate } from '@/utils/formatters';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AnnouncementsScreen() {
    const { openId } = useLocalSearchParams<{ openId?: string }>();
    const [announcements, setAnnouncements] = useState<MobileAnnouncement[]>([]);

    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const data = await announcementsApi.getAll();
            setAnnouncements(data);
        } catch { } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    useEffect(() => {
        if (openId && announcements.length > 0) {
            const announcement = announcements.find(a => a.id === Number(openId));
            if (announcement) {
                router.setParams({ openId: '' });
                router.push(`/(app)/announcement-detail?id=${openId}`);
            }
        }
    }, [openId, announcements]);

    const { refreshControl } = useRefresh(loadData);

    return (
        <View style={GlobalStyles.screen}>
            <ScrollView
                contentContainerStyle={GlobalStyles.scrollContent}
                refreshControl={refreshControl}
            >
                {announcements.length === 0 && !loading ? (
                    <View style={GlobalStyles.emptyContainer}>
                        <Text style={GlobalStyles.emptyText}>Brak</Text>
                    </View>
                ) : (
                    announcements.map((announcement) => (
                        <TouchableOpacity
                            key={announcement.id}
                            style={GlobalStyles.cardSmall}
                            onPress={() => router.push(`/(app)/announcement-detail?id=${announcement.id}`)}
                            activeOpacity={0.7}
                        >
                            <View style={[GlobalStyles.row, { marginBottom: Spacing[1], gap: Spacing[2] }]}>
                                {!announcement.isRead && (
                                    <View style={GlobalStyles.badge}>
                                        <Text style={GlobalStyles.badgeText}>nowe</Text>
                                    </View>
                                )}
                                <Text style={GlobalStyles.caption}>{formatDate(announcement.createdAt)}</Text>
                            </View>
                            <Text style={GlobalStyles.title}>{announcement.title}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

