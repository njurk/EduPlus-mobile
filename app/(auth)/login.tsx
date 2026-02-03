import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useCMSContent } from '@/hooks/useCMSContent';
import { API_URL } from '@/services/api';
import { isValidEmail } from '@/utils/validation';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LoginScreen() {
    const { login } = useAuth();
    const { getText: getSystemText } = useCMSContent('system');
    const { getText: getSubmitTicketText } = useCMSContent('submitTicket');
    const { getText: getResetText } = useCMSContent('resetPassword');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const logoUrl = getSystemText('faviconUrl', 'logo-64.png');
    const baseUrl = API_URL.replace('/api', '');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Wprowadź email i hasło');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Wprowadź poprawny adres email');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się zalogować');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={GlobalStyles.screen}
        >
            <View style={{ flex: 1, justifyContent: 'center', padding: Spacing[6] }}>
                <View style={{ alignItems: 'center', marginBottom: Spacing[8] }}>
                    <Image
                        source={{ uri: `${baseUrl}/${logoUrl}` }}
                        style={{ width: 80, height: 80, marginBottom: Spacing[4] }}
                        resizeMode="contain"
                    />
                    <Text style={{ fontSize: FontSizes['3xl'], fontWeight: '700', color: Colors.primary.DEFAULT, marginBottom: Spacing[2] }}>
                        {getSystemText('systemName', 'EduPlus')}
                    </Text>
                    <Text style={GlobalStyles.subtitle}>{getSystemText('pageTitle', 'Twój e-dziennik')}</Text>
                </View>

                <View style={[GlobalStyles.card, { ...Shadows.md, padding: Spacing[6] }]}>
                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Email</Text>
                        <TextInput
                            style={GlobalStyles.input}
                            placeholder="jan.kowalski@example.com"
                            placeholderTextColor={Colors.neutral[400]}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                    </View>

                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Hasło</Text>
                        <TextInput
                            style={GlobalStyles.input}
                            placeholder="••••••••"
                            placeholderTextColor={Colors.neutral[400]}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password"
                        />
                    </View>

                    {error ? <Text style={GlobalStyles.errorText}>{error}</Text> : null}

                    <TouchableOpacity
                        style={[GlobalStyles.buttonPrimary, isLoading && GlobalStyles.buttonDisabled, { marginTop: Spacing[2] }]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={GlobalStyles.buttonPrimaryText}>Zaloguj się</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={{ marginTop: Spacing[4], alignItems: 'center' }}>
                        <Text style={{ color: Colors.primary.DEFAULT, fontSize: FontSizes.sm }}>
                            {getResetText('title.request', 'Zapomniałeś hasła?')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => router.push('/(auth)/submit-ticket')} style={{ marginTop: Spacing[6], alignItems: 'center' }}>
                    <Text style={{ color: Colors.neutral[500], fontSize: FontSizes.sm }}>
                        {getSubmitTicketText('title', 'Masz problem? Kliknij tutaj')}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
