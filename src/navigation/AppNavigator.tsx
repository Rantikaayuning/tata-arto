import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MembersScreen from '../screens/MembersScreen';
import useExpenseStore from '../context/useExpenseStore';

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#343B71',
                tabBarInactiveTintColor: '#A0A3BD',
                tabBarStyle: {
                    height: 90,
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 0,
                    elevation: 20,
                    shadowColor: '#343B71',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: 'bold',
                    marginBottom: 10,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Beranda',
                    tabBarIcon: ({ color, focused }) => (
                        <View className={`items-center justify-center p-1 rounded-xl ${focused ? 'bg-gray-100' : ''}`}>
                            <Ionicons name="home" color={color} size={22} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Pockets"
                component={PocketsScreen}
                options={{
                    tabBarLabel: 'Dompet',
                    tabBarIcon: ({ color, focused }) => (
                        <View className={`items-center justify-center p-1 rounded-xl ${focused ? 'bg-gray-100' : ''}`}>
                            <Ionicons name="card" color={color} size={22} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    tabBarLabel: 'Cari',
                    tabBarIcon: ({ color, focused }) => (
                        <View className={`items-center justify-center p-1 rounded-xl ${focused ? 'bg-gray-100' : ''}`}>
                            <Ionicons name="search" color={color} size={22} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Monthly"
                component={MonthlyScreen}
                options={{
                    tabBarLabel: 'Laporan',
                    tabBarIcon: ({ color, focused }) => (
                        <View className={`items-center justify-center p-1 rounded-xl ${focused ? 'bg-gray-100' : ''}`}>
                            <Ionicons name="calendar" color={color} size={22} />
                        </View>
                    ),
                }}
            />
        </Tab.Navigator >
    );
};

const AppNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ animation: 'slide_from_right' }}
            />
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
            <Stack.Screen
                name="Members"
                component={MembersScreen}
                options={{ animation: 'slide_from_right' }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;
