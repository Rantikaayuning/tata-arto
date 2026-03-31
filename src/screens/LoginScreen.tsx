import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import useExpenseStore from "../context/useExpenseStore";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { Logo } from "../components/Logo";

const LoginScreen = ({ navigation }: any) => {
  const login = useExpenseStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Masukkan email dan password");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) {
        setIsLoading(false);
        if (error.message.includes("Invalid login credentials")) {
          Alert.alert(
            "Gagal Login",
            "Email atau password salah. Silakan coba lagi.",
          );
        } else if (error.message.includes("Email not confirmed")) {
          Alert.alert(
            "Email Belum Dikonfirmasi",
            "Silakan cek inbox email Anda dan klik link konfirmasi terlebih dahulu.",
          );
        } else {
          Alert.alert("Error", error.message);
        }
        return;
      }

      if (data.user) {
        login({
          id: data.user.id,
          name:
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0] ||
            "User",
          email: data.user.email || email,
          avatar: "person-circle",
        });
      }
    } catch (e: any) {
      setIsLoading(false);
      Alert.alert("Error", "Terjadi kesalahan koneksi. Silakan coba lagi.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="px-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("MainTabs")}
            className="absolute top-8 left-0 p-2 rounded-full bg-white/80 border border-gray-100 shadow-sm z-50"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <View className="items-center mb-12">
            <View className="w-28 h-28 bg-white rounded-[32px] items-center justify-center mb-6 shadow-xl shadow-indigo-500/10 border border-gray-100 transform -rotate-2">
              <Logo width={72} height={72} />
            </View>
            <Text className="text-4xl font-black text-primary tracking-tighter mb-2">
              tata arto.
            </Text>
            <Text className="text-gray-400 font-medium tracking-wide">
              Kelola Keuangan Bersama
            </Text>
          </View>

          <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <Text className="text-xl font-bold text-gray-800 mb-6">
              Masuk Akun
            </Text>

            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Email
              </Text>
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

            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Password
              </Text>
              <View className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 flex-row items-center">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9CA3AF"
                />
                <TextInput
                  className="flex-1 ml-3 font-medium text-gray-800"
                  placeholder="••••••••"
                  placeholderTextColor="#D1D5DB"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-1"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              className="self-end mb-6"
            >
              <Text className="text-primary font-bold text-sm">
                Lupa Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className="bg-primary py-4 rounded-2xl items-center shadow-lg shadow-indigo-900/20 active:scale-[0.98]"
            >
              <Text className="text-white font-bold text-lg">
                {isLoading ? "Memproses..." : "Masuk"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-400">Belum punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text className="text-primary font-bold">Daftar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
