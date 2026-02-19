import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import useExpenseStore from '../context/useExpenseStore';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }: any) => {
    const login = useExpenseStore((state) => state.login);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = () => {
        if (!name || !email || !password) return;

        setIsLoading(true);
        // Simulate API Call
        setTimeout(() => {
            setIsLoading(false);
            // In a real app, this would create a user in the backend
            // Here we just simulate a successful login with the new credentials
            login({
                id: Date.now().toString(),
                name: name,
                email: email,
                avatar: 'person-circle',
                role: 'admin' // First user is admin
            });
            navigation.navigate('MainTabs');
        }, 1500);
    };

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
                        <View className="w-20 h-20 bg-primary rounded-[28px] items-center justify-center mb-6 shadow-xl shadow-indigo-500/30 transform -rotate-3">
                            <Ionicons name="person-add" size={40} color="white" />
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
                                    placeholder="••••••••"
                                    placeholderTextColor="#D1D5DB"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
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
                            <TouchableOpacity onPress={() => navigation.goBack()}>
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
