import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useStudent } from '@/contexts/StudentContext';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function StudentPicker() {
    const { isStudent } = useAuth();
    const { children, selectedStudent, selectStudent, hasMultipleChildren } = useStudent();
    const [expanded, setExpanded] = useState(false);

    if (isStudent || !hasMultipleChildren) return null;

    const Icon = expanded ? ChevronUp : ChevronDown;

    return (
        <View style={{ marginTop: Spacing[2] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2] }}>
                <Text style={{ fontSize: FontSizes.sm, color: Colors.neutral[500] }}>Aktywny uczeń:</Text>
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.neutral[100], paddingHorizontal: Spacing[3], paddingVertical: Spacing[2], borderRadius: 4 }}
                    onPress={() => setExpanded(!expanded)}
                >
                    <Text style={{ fontSize: FontSizes.sm, fontWeight: '500', color: Colors.neutral[700] }}>{selectedStudent?.name ?? 'Wybierz ucznia'}</Text>
                    <Icon size={16} color={Colors.neutral[500]} style={{ marginLeft: Spacing[1] }} />
                </TouchableOpacity>
            </View>

            {expanded && (
                <View style={{ marginTop: Spacing[1], backgroundColor: Colors.white, borderRadius: 4, borderWidth: 1, borderColor: Colors.neutral[200], alignSelf: 'flex-start' }}>
                    {children.map(c => (
                        <TouchableOpacity
                            key={c.id}
                            style={{ paddingVertical: Spacing[2], paddingHorizontal: Spacing[3], backgroundColor: selectedStudent?.id === c.id ? Colors.primary.light : 'transparent' }}
                            onPress={() => { selectStudent(c.id); setExpanded(false); }}
                        >
                            <Text style={{ fontSize: FontSizes.sm, color: Colors.neutral[800], fontWeight: selectedStudent?.id === c.id ? '600' : '400' }}>{c.name}</Text>
                            {c.className && <Text style={{ fontSize: FontSizes.xs, color: Colors.neutral[500] }}>{c.className}</Text>}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}
