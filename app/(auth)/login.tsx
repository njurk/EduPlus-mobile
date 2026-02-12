import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useCMSContent } from '@/hooks/useCMSContent';
import { BASE_URL } from '@/services/api';
import { validateLoginForm } from '@/utils/validation';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
    const { getText } = useCMSContent('mobileLogin');
    const { getText: getSystemText } = useCMSContent('system');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const logoUrl = `${BASE_URL}/${getSystemText('logoUrl')}`;

    useEffect(() => {
        const newErrors = validateLoginForm(email, password);
        setErrors(prev => ({ ...prev, password: newErrors.password }));
    }, [password]);

    const handleLogin = async () => {
        const validationErrors = validateLoginForm(email, password);
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setApiError('');
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setApiError(err instanceof Error ? err.message : 'Nie udało się zalogować');
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
                        source={{ uri: logoUrl }}
                        style={{ width: 80, height: 80, marginBottom: Spacing[4] }}
                        resizeMode="contain"
                    />
                    <Text style={{ fontSize: FontSizes['3xl'], fontWeight: '700', color: Colors.primary.DEFAULT, marginBottom: Spacing[2] }}>
                        {getSystemText('systemName')}
                    </Text>
                    <Text style={GlobalStyles.subtitle}>{getText('subtitle')}</Text>
                </View>

                <View style={[GlobalStyles.card, { padding: Spacing[6] }]}>
                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Email</Text>
                        <TextInput
                            style={[GlobalStyles.input, errors.email && { borderColor: Colors.danger.DEFAULT }]}
                            placeholder="jankowalski@gmail.com"
                            placeholderTextColor={Colors.neutral[400]}
                            value={email}
                            onChangeText={(text) => { setEmail(text); setErrors(({ email: _, ...rest }) => rest); }}
                            onBlur={() => { const e = validateLoginForm(email, password); if (e.email) setErrors(prev => ({ ...prev, email: e.email })); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                        {errors.email && <Text style={GlobalStyles.errorText}>{errors.email}</Text>}
                    </View>

                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Hasło</Text>
                        <TextInput
                            style={[GlobalStyles.input, password.length > 0 && errors.password && { borderColor: Colors.danger.DEFAULT }]}
                            placeholder="********"
                            placeholderTextColor={Colors.neutral[400]}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password"
                        />
                        {password.length > 0 && errors.password && <Text style={GlobalStyles.errorText}>{errors.password}</Text>}
                    </View>

                    {apiError ? <Text style={GlobalStyles.errorText}>{apiError}</Text> : null}

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
                            {getText('link.forgotPassword')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => router.push('/(auth)/submit-ticket')} style={{ marginTop: Spacing[6], alignItems: 'center' }}>
                    <Text style={{ color: Colors.neutral[500], fontSize: FontSizes.sm }}>
                        {getText('link.submitTicket')}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
