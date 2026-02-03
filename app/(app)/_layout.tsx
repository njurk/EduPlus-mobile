import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

type IconName = keyof typeof Ionicons.glyphMap;

interface TabConfig {
    name: string;
    title: string;
    icon: IconName;
    parentOnly?: boolean;
}

const tabs: TabConfig[] = [
    { name: 'index', title: 'Główna', icon: 'home' },
    { name: 'grades', title: 'Oceny', icon: 'star' },
    { name: 'attendance', title: 'Frekwencja', icon: 'calendar' },
    { name: 'schedule', title: 'Plan', icon: 'time' },
    { name: 'announcements', title: 'Ogłoszenia', icon: 'megaphone' },
    { name: 'excuses', title: 'Usprawiedliwienia', icon: 'document-text', parentOnly: true },
];

export default function AppLayout() {
    const { isParent } = useAuth();
    const theme = Colors.light;

    const visibleTabs = tabs.filter(tab => !tab.parentOnly || isParent);

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.tint,
                tabBarInactiveTintColor: theme.tabIconDefault,
                tabBarStyle: {
                    backgroundColor: theme.card,
                    borderTopColor: theme.border,
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
                        title: tab.title,
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name={tab.icon} size={size} color={color} />
                        ),
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
        </Tabs>
    );
}
