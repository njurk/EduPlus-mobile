import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { announcementsApi, MobileAnnouncementDto, mobileApi } from '@/services/api';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AnnouncementsScreen() {
    const [announcements, setAnnouncements] = useState<MobileAnnouncementDto[]>([]);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<MobileAnnouncementDto | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const data = await mobileApi.getAnnouncements();
            setAnnouncements(data);
        } catch { } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handlePress = async (announcement: MobileAnnouncementDto) => {
        setSelectedAnnouncement(announcement);
        if (!announcement.isRead) {
            try {
                await announcementsApi.markAsRead(announcement.id);
                setAnnouncements(prev =>
                    prev.map(a => (a.id === announcement.id ? { ...a, isRead: true } : a))
                );
            } catch { }
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <View style={GlobalStyles.screen}>
            <ScrollView
                contentContainerStyle={GlobalStyles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.DEFAULT]} />}
            >
                {announcements.length === 0 && !loading ? (
                    <View style={GlobalStyles.emptyContainer}>
                        <Text style={GlobalStyles.emptyText}>Brak ogłoszeń</Text>
                    </View>
                ) : (
                    announcements.map((announcement) => (
                        <TouchableOpacity
                            key={announcement.id}
                            style={[GlobalStyles.cardSmall, !announcement.isRead && { borderLeftWidth: 3, borderLeftColor: Colors.primary.DEFAULT }]}
                            onPress={() => handlePress(announcement)}
                            activeOpacity={0.7}
                        >
                            <View style={[GlobalStyles.row, { marginBottom: Spacing[2], gap: Spacing[2] }]}>
                                {!announcement.isRead && (
                                    <View style={GlobalStyles.badge}>
                                        <Text style={GlobalStyles.badgeText}>nowe</Text>
                                    </View>
                                )}
                                <Text style={GlobalStyles.caption}>{formatDate(announcement.createdAt)}</Text>
                            </View>
                            <Text style={GlobalStyles.title}>{announcement.title}</Text>
                            <Text style={[GlobalStyles.subtitle, { lineHeight: 20, marginTop: Spacing[1] }]} numberOfLines={2}>
                                {announcement.content.replace(/<[^>]*>/g, '')}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <Modal
                visible={selectedAnnouncement !== null}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedAnnouncement(null)}
            >
                {selectedAnnouncement && (
                    <View style={GlobalStyles.modalContainer}>
                        <View style={GlobalStyles.modalHeader}>
                            <TouchableOpacity onPress={() => setSelectedAnnouncement(null)} style={{ paddingHorizontal: Spacing[2], paddingVertical: Spacing[1] }}>
                                <Text style={{ color: Colors.primary.DEFAULT, fontSize: FontSizes.base, fontWeight: '500' }}>Zamknij</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={GlobalStyles.modalContent}>
                            <Text style={[GlobalStyles.caption, { marginBottom: Spacing[2] }]}>{formatDate(selectedAnnouncement.createdAt)}</Text>
                            <Text style={[GlobalStyles.headerMedium, { marginBottom: Spacing[4] }]}>{selectedAnnouncement.title}</Text>
                            <Text style={{ fontSize: FontSizes.base, color: Colors.neutral[700], lineHeight: 24 }}>
                                {selectedAnnouncement.content.replace(/<[^>]*>/g, '')}
                            </Text>
                        </ScrollView>
                    </View>
                )}
            </Modal>
        </View>
    );
}
