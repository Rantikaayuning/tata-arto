import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import MonthlyScreen from '../screens/MonthlyScreen';
import PocketDetailScreen from '../screens/PocketDetailScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import PocketsScreen from '../screens/PocketsScreen';
import SearchScreen from '../screens/SearchScreen';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#528567',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarItemStyle: {
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarStyle: {
                    height: 80,
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 0,
                    elevation: 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    paddingTop: 10,
                    paddingBottom: 20,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: 5,
                },
                tabBarIconStyle: {
                    marginBottom: 0,
                },
                tabBarItemStyle: {
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 4,
                }
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Harian',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View className={`items-center justify-center p-1 rounded-xl ${focused ? 'bg-gray-100' : ''}`}>
                            <Ionicons name="home" color={color} size={size + 2} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Pockets"
                component={PocketsScreen}
                options={{
                    tabBarLabel: 'Dompet',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View className={`items-center justify-center p-1 rounded-xl ${focused ? 'bg-gray-100' : ''}`}>
                            <Ionicons name="card" color={color} size={size + 2} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    tabBarLabel: 'Pencarian',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View className={`items-center justify-center p-1 rounded-xl ${focused ? 'bg-gray-100' : ''}`}>
                            <Ionicons name="search" color={color} size={size + 2} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Monthly"
                component={MonthlyScreen}
                options={{
                    tabBarLabel: 'Bulanan',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View className={`items-center justify-center p-1 rounded-xl ${focused ? 'bg-gray-100' : ''}`}>
                            <Ionicons name="calendar" color={color} size={size + 2} />
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen
                    name="PocketDetail"
                    component={PocketDetailScreen}
                    options={{ animation: 'slide_from_right' }}
                />
                <Stack.Screen
                    name="AddExpense"
                    component={AddExpenseScreen}
                    options={{
                        presentation: 'transparentModal',
                        animation: 'slide_from_bottom',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
