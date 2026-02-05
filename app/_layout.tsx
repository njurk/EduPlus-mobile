import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { StudentProvider } from '@/contexts/StudentContext';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

function RootLayoutNav() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(app)" />;
}

function AppNavigator() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StudentProvider>
        <AppNavigator />
        <RootLayoutNav />
      </StudentProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
});
