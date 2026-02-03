import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useCMSContent } from '@/hooks/useCMSContent';
import { authApi } from '@/services/api';
import { isValidEmail } from '@/utils/validation';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ForgotPasswordScreen() {
    const { getText } = useCMSContent('resetPassword');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            setError('Wprowadź adres email');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Wprowadź poprawny adres email');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await authApi.requestPasswordReset(email);
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się wysłać emaila');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <View style={[GlobalStyles.screen, { justifyContent: 'center', padding: Spacing[6] }]}>
                <View style={[GlobalStyles.card, { padding: Spacing[6], alignItems: 'center' }]}>
                    <Text style={[GlobalStyles.title, { marginBottom: Spacing[3], textAlign: 'center' }]}>
                        {getText('title.sent', 'Sprawdź swoją skrzynkę')}
                    </Text>
                    <Text style={[GlobalStyles.subtitle, { textAlign: 'center', marginBottom: Spacing[2] }]}>
                        {getText('message.sent', 'Jeśli adres {email} istnieje w naszej bazie, za chwilę otrzymasz wiadomość z linkiem do resetowania hasła.').replace('{email}', email)}
                    </Text>
                    <Text style={[GlobalStyles.subtitle, { textAlign: 'center', marginBottom: Spacing[4], color: Colors.neutral[500] }]}>
                        {getText('message.linkExpirationTime', 'Link wygasa po 1 godzinie')}
                    </Text>
                    <TouchableOpacity
                        style={GlobalStyles.buttonPrimary}
                        onPress={() => router.back()}
                    >
                        <Text style={GlobalStyles.buttonPrimaryText}>Powrót do logowania</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={GlobalStyles.screen}
        >
            <View style={{ flex: 1, justifyContent: 'center', padding: Spacing[6] }}>
                <View style={{ alignItems: 'center', marginBottom: Spacing[8] }}>
                    <Text style={{ fontSize: FontSizes['2xl'], fontWeight: '700', color: Colors.neutral[800], marginBottom: Spacing[2] }}>
                        {getText('title.request', 'Resetowanie hasła')}
                    </Text>
                    <Text style={[GlobalStyles.subtitle, { textAlign: 'center' }]}>
                        Podaj adres email powiązany z kontem
                    </Text>
                </View>

                <View style={[GlobalStyles.card, { padding: Spacing[6] }]}>
                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Email</Text>
                        <TextInput
                            style={GlobalStyles.input}
                            placeholder="example@gmail.com"
                            placeholderTextColor={Colors.neutral[400]}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                    </View>

                    {error ? <Text style={GlobalStyles.errorText}>{error}</Text> : null}

                    <TouchableOpacity
                        style={[GlobalStyles.buttonPrimary, isLoading && GlobalStyles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={GlobalStyles.buttonPrimaryText}>Wyślij</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: Spacing[6], alignItems: 'center' }}>
                    <Text style={{ color: Colors.neutral[500], fontSize: FontSizes.sm }}>Powrót do logowania</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
