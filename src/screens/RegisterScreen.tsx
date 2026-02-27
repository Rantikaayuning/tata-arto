import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/Logo';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }: any) => {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        if (!trimmedName || !trimmedEmail || !trimmedPassword) {
            Alert.alert('Error', 'Mohon isi semua field');
            return;
        }

        if (trimmedPassword.length < 6) {
            Alert.alert('Error', 'Password minimal 6 karakter');
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: trimmedEmail,
                password: trimmedPassword,
                options: {
                    data: {
                        full_name: trimmedName,
                        avatar_url: 'person-circle'
                    }
                }
            });

            setIsLoading(false);

            if (error) {
                let errorMessage = error.message;
                if (error.message.includes('already registered') || error.message.includes('already been registered')) {
                    errorMessage = 'Email ini sudah terdaftar. Silakan login atau gunakan email lain.';
                }
                Alert.alert('Registrasi Gagal', errorMessage);
                return;
            }

            // Check for fake signup (email already exists with confirmation enabled)
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                Alert.alert(
                    'Email Sudah Terdaftar',
                    'Email ini sudah digunakan. Silakan login atau reset password jika lupa.',
                    [
                        { text: 'Login', onPress: () => navigation.navigate('Login') },
                        { text: 'Lupa Password', onPress: () => navigation.navigate('ForgotPassword') },
                        { text: 'OK', style: 'cancel' }
                    ]
                );
                return;
            }

            if (data.user) {
                // Show email confirmation screen
                setIsRegistered(true);
            }
        } catch (e: any) {
            setIsLoading(false);
            console.log('Register exception:', e);
            Alert.alert('Error', 'Terjadi kesalahan koneksi. Silakan coba lagi.');
        }
    };

    // Success state - show email confirmation message
    if (isRegistered) {
        return (
            <SafeAreaView className="flex-1 bg-[#F7F8FA]">
                <View className="flex-1 justify-center px-8">
                    <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 items-center">
                        <View className="w-20 h-20 bg-indigo-50 rounded-full items-center justify-center mb-6">
                            <Ionicons name="mail-unread-outline" size={40} color="#343B71" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">Cek Email Anda!</Text>
                        <Text className="text-gray-400 text-center leading-6 mb-3">
                            Kami telah mengirim link konfirmasi ke:
                        </Text>
                        <Text className="text-primary font-bold text-center mb-4">
                            {email.trim().toLowerCase()}
                        </Text>
                        <Text className="text-gray-400 text-center leading-6 mb-8">
                            Klik link di email untuk mengaktifkan akun Anda, lalu kembali ke sini untuk login.
                        </Text>

                        <View className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex-row items-start mb-8 w-full">
                            <Ionicons name="alert-circle" size={20} color="#F59E0B" style={{ marginTop: 2 }} />
                            <Text className="ml-3 text-amber-800 leading-5 flex-1 text-sm">
                                Tidak menerima email? Cek folder spam atau coba daftar ulang dengan email yang sama.
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}
                            className="bg-primary py-4 rounded-2xl items-center w-full shadow-lg shadow-indigo-900/20"
                        >
                            <Text className="text-white font-bold text-lg">Ke Halaman Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F7F8FA]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1 justify-center px-8 relative">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('MainTabs')}
                        className="absolute top-8 left-8 p-2 rounded-full bg-white/80 border border-gray-100 shadow-sm z-50"
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>

                    {/* Header / Logo Section */}
                    <View className="items-center mb-8">
                        <View className="w-24 h-24 bg-white rounded-[32px] items-center justify-center mb-6 shadow-xl shadow-indigo-500/10 border border-gray-100 transform rotate-2">
                            <Logo width={60} height={60} />
                        </View>
                        <Text className="text-3xl font-black text-primary tracking-tighter mb-2">Buat Akun Baru</Text>
                        <Text className="text-gray-400 font-medium tracking-wide text-center">Mulai kelola keuanganmu dengan lebih baik bersama tata arto.</Text>
                    </View>

                    {/* Form Section */}
                    <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">

                        <View className="mb-4">
                            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Nama Lengkap</Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 flex-row items-center focus:border-primary">
                                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                                <TextInput
                                    className="flex-1 ml-3 font-medium text-gray-800"
                                    placeholder="Nama Kamu"
                                    placeholderTextColor="#D1D5DB"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Email</Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 flex-row items-center focus:border-primary">
                                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                                <TextInput
                                    className="flex-1 ml-3 font-medium text-gray-800"
                                    placeholder="nama@email.com"
                                    placeholderTextColor="#D1D5DB"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View className="mb-8">
                            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Password</Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 flex-row items-center">
                                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                                <TextInput
                                    className="flex-1 ml-3 font-medium text-gray-800"
                                    placeholder="Minimal 6 karakter"
                                    placeholderTextColor="#D1D5DB"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={22}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={isLoading}
                            className="bg-primary py-4 rounded-2xl items-center shadow-lg shadow-indigo-900/20 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <Text className="text-white font-bold text-lg">Membuat Akun...</Text>
                            ) : (
                                <Text className="text-white font-bold text-lg">Daftar Sekarang</Text>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row justify-center mt-6">
                            <Text className="text-gray-400">Sudah punya akun? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text className="text-primary font-bold">Masuk</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterScreen;
