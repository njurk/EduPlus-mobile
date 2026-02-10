import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { announcementsApi, MobileAnnouncementDto, mobileApi } from '@/services/api';
import { formatDateTime } from '@/utils/formatters';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import RenderHtml from 'react-native-render-html';

export default function AnnouncementDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [announcement, setAnnouncement] = useState<MobileAnnouncementDto | null>(null);
    const [loading, setLoading] = useState(true);
    const { width } = useWindowDimensions();

    useEffect(() => {
        loadAnnouncement();
    }, [id]);

    const loadAnnouncement = async () => {
        if (!id) {
            router.back();
            return;
        }

        setAnnouncement(null);
        setLoading(true);

        try {
            const data = await mobileApi.getAnnouncements();
            const found = data.find(a => a.id === Number(id));
            if (found) {
                setAnnouncement(found);
                if (!found.isRead) {
                    await announcementsApi.markAsRead(found.id);
                }
            } else {
                router.back();
            }
        } catch {
            router.back();
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[GlobalStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </View>
        );
    }

    if (!announcement) return null;

    const contentWidth = width - Spacing[4] * 4;

    return (
        <View style={GlobalStyles.screen}>
            <ScrollView contentContainerStyle={GlobalStyles.scrollContent}>
                <View style={GlobalStyles.card}>
                    <Text style={[GlobalStyles.headerMedium, { marginBottom: Spacing[4] }]}>
                        {announcement.title}
                    </Text>
                    <RenderHtml
                        contentWidth={contentWidth}
                        source={{ html: announcement.content }}
                        baseStyle={{
                            fontSize: FontSizes.sm,
                            color: Colors.neutral[700],
                            lineHeight: 24,
                        }}
                        tagsStyles={{
                            p: { marginBottom: 8 },
                            a: { color: Colors.primary.DEFAULT },
                            strong: { fontWeight: '700' },
                            em: { fontStyle: 'italic' },
                            ul: { marginLeft: 16, marginBottom: 8 },
                            ol: { marginLeft: 16, marginBottom: 8 },
                            li: { marginBottom: 4 },
                        }}
                    />
                    <View style={{ marginTop: Spacing[4], paddingTop: Spacing[4], borderTopWidth: 1, borderTopColor: Colors.neutral[200] }}>
                        <Text style={GlobalStyles.caption}>Data publikacji: {formatDateTime(announcement.createdAt)}</Text>
                        <Text style={GlobalStyles.caption}>Autor: {announcement.authorName}</Text>
                        {announcement.updatedAt && (
                            <Text style={[GlobalStyles.caption]}>
                                Edytowano: {formatDateTime(announcement.updatedAt)}
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
