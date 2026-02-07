import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useCMSContent } from '@/hooks/useCMSContent';
import { BASE_URL } from '@/services/api';
import { Tabs, router } from 'expo-router';
import { ArrowLeft, CheckCircle, FileCheck, Layout, LogOut, LucideIcon, Megaphone, Settings, Star, Table } from 'lucide-react-native';
import React from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

interface TabConfig {
    name: string;
    pageLabel: string;
    icon: LucideIcon;
    parentOnly?: boolean;
}

const tabs: TabConfig[] = [
    { name: 'index', pageLabel: 'mobileDashboard', icon: Layout },
    { name: 'grades', pageLabel: 'mobileGrades', icon: Star },
    { name: 'attendance', pageLabel: 'mobileAttendance', icon: CheckCircle },
    { name: 'schedule', pageLabel: 'mobileSchedule', icon: Table },
    { name: 'announcements', pageLabel: 'mobileAnnouncements', icon: Megaphone },
    { name: 'excuses', pageLabel: 'mobileExcuses', icon: FileCheck, parentOnly: true },
];

export default function AppLayout() {
    const { isParent, logout } = useAuth();
    const { getText: getSystemText } = useCMSContent('system');
    const { getText: getDashboardText } = useCMSContent('mobileDashboard');
    const { getText: getGradesText } = useCMSContent('mobileGrades');
    const { getText: getAttendanceText } = useCMSContent('mobileAttendance');
    const { getText: getScheduleText } = useCMSContent('mobileSchedule');
    const { getText: getAnnouncementsText } = useCMSContent('mobileAnnouncements');
    const { getText: getExcusesText } = useCMSContent('mobileExcuses');
    const { getText: getSettingsText } = useCMSContent('mobileSettings');
    const { getText: getAnnouncementDetailText } = useCMSContent('mobileAnnouncementDetail');
    const { getText: getExcuseFormText } = useCMSContent('mobileExcuseForm');
    const theme = Colors.light;

    const getTabLabel = (pageLabel: string): string => {
        const getters: Record<string, (key: string) => string> = {
            mobileDashboard: getDashboardText,
            mobileGrades: getGradesText,
            mobileAttendance: getAttendanceText,
            mobileSchedule: getScheduleText,
            mobileAnnouncements: getAnnouncementsText,
            mobileExcuses: getExcusesText,
        };
        return getters[pageLabel]?.('title') ?? '';
    };

    const visibleTabs = tabs.filter(tab => !tab.parentOnly || isParent);
    const logoUrl = `${BASE_URL}/${getSystemText('logoUrl')}`;

    const confirmLogout = () => {
        Alert.alert(
            'Wyloguj',
            'Czy na pewno chcesz się wylogować?',
            [
                { text: 'Anuluj', style: 'cancel' },
                { text: 'Tak', style: 'destructive', onPress: logout },
            ]
        );
    };

    const HeaderTitle = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[5] }}>
            <Image
                source={{ uri: logoUrl }}
                style={{ width: 38, height: 38 }}
                resizeMode="contain"
            />
            <Text style={{ fontSize: FontSizes.lg, fontWeight: '600', color: theme.text }}>
                {getSystemText('systemName')}
            </Text>
        </View>
    );

    const HeaderRight = () => (
        <View style={{ flexDirection: 'row', marginRight: Spacing[6], gap: Spacing[8] }}>
            <TouchableOpacity onPress={() => router.push('/(app)/settings')}>
                <Settings size={26} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmLogout}>
                <LogOut size={26} color={theme.text} />
            </TouchableOpacity>
        </View>
    );

    const BackButton = ({ onPress }: { onPress: () => void }) => (
        <TouchableOpacity onPress={onPress} style={{ marginLeft: Spacing[4] }}>
            <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
    );

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.tint,
                tabBarInactiveTintColor: theme.tabIconDefault,
                tabBarStyle: {
                    backgroundColor: theme.card,
                    borderTopColor: theme.border,
                    height: 110,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: FontSizes.xs,
                    fontWeight: '500',
                },
                headerStyle: {
                    backgroundColor: theme.card,
                },
                headerTintColor: theme.text,
            }}
        >
            {visibleTabs.map(tab => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: getTabLabel(tab.pageLabel),
                        tabBarLabel: getTabLabel(tab.pageLabel),
                        tabBarIcon: ({ color }) => {
                            const Icon = tab.icon;
                            return <Icon size={26} color={color} />;
                        },
                        ...(tab.name === 'index' && {
                            headerTitle: HeaderTitle,
                            headerRight: HeaderRight,
                        }),
                    }}
                />
            ))}
            {tabs
                .filter(tab => tab.parentOnly && !isParent)
                .map(tab => (
                    <Tabs.Screen
                        key={tab.name}
                        name={tab.name}
                        options={{
                            href: null,
                        }}
                    />
                ))}
            <Tabs.Screen
                name="settings"
                options={{
                    href: null,
                    title: getSettingsText('title'),
                    headerLeft: () => <BackButton onPress={() => router.back()} />,
                }}
            />
            <Tabs.Screen
                name="announcement-detail"
                options={{
                    href: null,
                    title: getAnnouncementDetailText('title'),
                    headerLeft: () => <BackButton onPress={() => router.navigate('/(app)/announcements')} />,
                }}
            />
            <Tabs.Screen
                name="excuse-form"
                options={{
                    href: null,
                    title: getExcuseFormText('title'),
                    headerLeft: () => <BackButton onPress={() => router.navigate('/(app)/excuses')} />,
                }}
            />
        </Tabs>
    );
}
