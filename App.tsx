import "./global.css"; // NativeWind CSS
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { supabase } from "./src/lib/supabase";
import { View, ActivityIndicator } from "react-native";
import useExpenseStore from "./src/context/useExpenseStore";

export default function App() {
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const login = useExpenseStore((state) => state.login);
  const user = useExpenseStore((state) => state.user);

  useEffect(() => {
    // Check existing session on app startup
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setIsLoggedIn(true);
          // Set user in store
          login({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || "User",
            email: session.user.email || "",
            avatar: "person-circle",
          });
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsLoggedIn(false);
      } finally {
        setIsSessionChecked(true);
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        login({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || "User",
          email: session.user.email || "",
          avatar: "person-circle",
        });
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [login]);

  if (!isSessionChecked) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 bg-[#F7F8FA] items-center justify-center">
          <ActivityIndicator size="large" color="#343B71" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppNavigator isLoggedIn={isLoggedIn} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
