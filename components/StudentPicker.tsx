import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useStudent } from '@/contexts/StudentContext';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function StudentPicker() {
    const { children, selectedStudent, selectStudent, hasMultipleChildren } = useStudent();
    const [expanded, setExpanded] = useState(false);

    if (!hasMultipleChildren) return null;

    const Icon = expanded ? ChevronUp : ChevronDown;

    return (
        <View style={{ marginBottom: Spacing[3], zIndex: 20 }}>
            <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: Colors.primary.light, paddingHorizontal: Spacing[3], paddingVertical: Spacing[2], borderRadius: 8 }}
                onPress={() => setExpanded(!expanded)}
            >
                <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: Colors.primary.hover }}>{selectedStudent?.name ?? 'Wybierz ucznia'}</Text>
                <Icon size={16} color={Colors.primary.hover} style={{ marginLeft: Spacing[1] }} />
            </TouchableOpacity>

            {expanded && (
                <View style={{ position: 'absolute', top: '100%', left: 0, marginTop: Spacing[1], backgroundColor: Colors.white, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4, minWidth: 150 }}>
                    {children.map(c => (
                        <TouchableOpacity
                            key={c.id}
                            style={{ paddingVertical: Spacing[2], paddingHorizontal: Spacing[3], backgroundColor: selectedStudent?.id === c.id ? Colors.primary.light : 'transparent' }}
                            onPress={() => { selectStudent(c.id); setExpanded(false); }}
                        >
                            <Text style={{ fontSize: FontSizes.sm, color: selectedStudent?.id === c.id ? Colors.primary.hover : Colors.neutral[700], fontWeight: selectedStudent?.id === c.id ? '600' : '400' }}>{c.name}</Text>
                            {c.className && <Text style={{ fontSize: FontSizes.xs, color: Colors.neutral[500] }}>{c.className}</Text>}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}
