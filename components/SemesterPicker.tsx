import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { semestersApi } from '@/services/api';
import type { MobileSemesterDto } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props { onSemesterChange: (semesterId: number) => void; }

export default function SemesterPicker({ onSemesterChange }: Props) {
    const [semesters, setSemesters] = useState<MobileSemesterDto[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        semestersApi.getAll().then(data => {
            setSemesters(data);
            const current = data.find(s => s.isCurrent) ?? data[0];
            if (current) { setSelectedId(current.id); onSemesterChange(current.id); }
        }).catch(() => { });
    }, []);

    const select = (id: number) => { setSelectedId(id); setExpanded(false); onSemesterChange(id); };

    if (!semesters.length) return null;

    const Icon = expanded ? ChevronUp : ChevronDown;
    const selected = semesters.find(s => s.id === selectedId);

    return (
        <View style={{ marginBottom: Spacing[3] }}>
            <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.neutral[100], paddingHorizontal: Spacing[3], paddingVertical: Spacing[2], borderRadius: 4, alignSelf: 'flex-start' }}
                onPress={() => setExpanded(!expanded)}
            >
                <Text style={{ fontSize: FontSizes.sm, fontWeight: '500', color: Colors.neutral[700] }}>{selected?.name ?? 'Semestr'}</Text>
                <Icon size={16} color={Colors.neutral[500]} style={{ marginLeft: Spacing[1] }} />
            </TouchableOpacity>

            {expanded && (
                <View style={{ marginTop: Spacing[1], backgroundColor: Colors.white, borderRadius: 4, borderWidth: 1, borderColor: Colors.neutral[200], alignSelf: 'flex-start' }}>
                    {semesters.map(s => (
                        <TouchableOpacity key={s.id} style={{ paddingVertical: Spacing[2], paddingHorizontal: Spacing[3], backgroundColor: selectedId === s.id ? Colors.primary.light : 'transparent' }} onPress={() => select(s.id)}>
                            <Text style={{ fontSize: FontSizes.sm, color: Colors.neutral[800], fontWeight: selectedId === s.id ? '600' : '400' }}>{s.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}
