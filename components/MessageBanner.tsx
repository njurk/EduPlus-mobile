import { Colors, FontSizes, Spacing } from '@/constants/theme';
import React from 'react';
import { Text, View } from 'react-native';

interface Props {
    type: 'success' | 'error';
    text: string;
}

export default function MessageBanner({ type, text }: Props) {
    const isSuccess = type === 'success';
    return (
        <View style={{
            backgroundColor: isSuccess ? Colors.success.light : Colors.danger.light,
            padding: Spacing[3],
            borderRadius: 8,
            marginBottom: Spacing[4],
        }}>
            <Text style={{
                color: isSuccess ? Colors.success.text : Colors.danger.text,
                fontSize: FontSizes.sm,
            }}>
                {text}
            </Text>
        </View>
    );
}
