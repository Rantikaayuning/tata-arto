import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/Logo';

const ForgotPasswordScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleResetPassword = async () => {
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail) {
            Alert.alert('Error', 'Mohon masukkan email Anda');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
            setIsLoading(false);

            if (error) {
                Alert.alert('Gagal', error.message);
            } else {
                setIsSent(true);
            }
        } catch (e) {
            setIsLoading(false);
            Alert.alert('Error', 'Terjadi kesalahan koneksi.');
        }
    };

    if (isSent) {
        return (
            <SafeAreaView className="flex-1 bg-[#F7F8FA]">
                <View className="flex-1 justify-center px-8">
                    <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 items-center">
                        <View className="w-20 h-20 bg-green-50 rounded-full items-center justify-center mb-6">
                            <Ionicons name="mail-open-outline" size={40} color="#22C55E" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">Email Terkirim!</Text>
                        <Text className="text-gray-400 text-center leading-6 mb-8">
                            Kami telah mengirim link reset password ke {email.trim().toLowerCase()}. Silakan cek inbox atau folder spam Anda.
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}
                            className="bg-primary py-4 rounded-2xl items-center w-full shadow-lg shadow-indigo-900/20"
                        >
                            <Text className="text-white font-bold text-lg">Kembali ke Login</Text>
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
                        onPress={() => navigation.goBack()}
                        className="absolute top-8 left-8 p-2 rounded-full bg-white/80 border border-gray-100 shadow-sm z-50"
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>

                    <View className="items-center mb-8">
                        <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-6 shadow-xl shadow-indigo-500/10 border border-gray-100">
                            <Ionicons name="key-outline" size={36} color="#343B71" />
                        </View>
                        <Text className="text-3xl font-black text-primary tracking-tighter mb-2">Lupa Password?</Text>
                        <Text className="text-gray-400 font-medium tracking-wide text-center">
                            Masukkan email Anda dan kami akan mengirim link untuk reset password.
                        </Text>
                    </View>

                    <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                        <View className="mb-8">
                            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Email</Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 flex-row items-center">
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

                        <TouchableOpacity
                            onPress={handleResetPassword}
                            disabled={isLoading}
                            className="bg-primary py-4 rounded-2xl items-center shadow-lg shadow-indigo-900/20 active:scale-[0.98]"
                        >
                            <Text className="text-white font-bold text-lg">
                                {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center mt-6">
                            <Text className="text-gray-400">Ingat password? </Text>
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

export default ForgotPasswordScreen;
