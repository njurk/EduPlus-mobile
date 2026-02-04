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
    headerTitleKey?: string;
    tabLabel: string;
    icon: LucideIcon;
    parentOnly?: boolean;
}

const tabs: TabConfig[] = [
    { name: 'index', headerTitleKey: 'systemName', tabLabel: 'Pulpit', icon: Layout },
    { name: 'grades', tabLabel: 'Oceny', icon: Star },
    { name: 'attendance', tabLabel: 'Frekwencja', icon: CheckCircle },
    { name: 'schedule', tabLabel: 'Plan lekcji', icon: Table },
    { name: 'announcements', tabLabel: 'Ogłoszenia', icon: Megaphone },
    { name: 'excuses', tabLabel: 'Usprawiedliwienia', icon: FileCheck, parentOnly: true },
];

export default function AppLayout() {
    const { isParent, logout } = useAuth();
    const { getText } = useCMSContent('system');
    const theme = Colors.light;

    const visibleTabs = tabs.filter(tab => !tab.parentOnly || isParent);
    const logoUrl = `${BASE_URL}/${getText('logoUrl', 'logo-512.png')}`;

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
                {getText('systemName', 'EduPlus')}
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

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.tint,
                tabBarInactiveTintColor: theme.tabIconDefault,
                tabBarStyle: {
                    backgroundColor: theme.card,
                    borderTopColor: theme.border,
                    height: 95,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 14,
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
                        title: tab.tabLabel,
                        tabBarLabel: tab.tabLabel,
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
                    title: 'Ustawienia',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => require('expo-router').router.back()}
                            style={{ marginLeft: 16 }}
                        >
                            <ArrowLeft size={24} color={theme.text} />
                        </TouchableOpacity>
                    ),
                }}
            />
        </Tabs>
    );
}
