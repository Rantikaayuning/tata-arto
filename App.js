import './global.css'; // NativeWind CSS
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import useExpenseStore from './src/context/useExpenseStore';

export default function App() {
  const resetCategories = useExpenseStore((state) => state.resetCategories);

  // HACK: Reset category data AGAIN to implement 'Utama' only logic
  useEffect(() => {
    resetCategories();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
