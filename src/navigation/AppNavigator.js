import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Platform, StatusBar } from 'react-native';


import HomeScreen from '../screens/HomeScreen';
import MonthlyScreen from '../screens/MonthlyScreen';
import PocketDetailScreen from '../screens/PocketDetailScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import PocketsScreen from '../screens/PocketsScreen';
import SearchScreen from '../screens/SearchScreen';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
    return (
        <Tab.Navigator
            tabBarPosition="bottom"
            screenOptions={{
                swipeEnabled: true,
                animationEnabled: true,
                tabBarActiveTintColor: '#343B71',
                tabBarInactiveTintColor: '#A0A3BD',
                tabBarIndicatorStyle: {
                    height: 0,
                    backgroundColor: 'transparent',
                },
                tabBarStyle: {
                    height: 80,
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 0,
                    elevation: 20,
                    shadowColor: '#343B71',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                    paddingBottom: 10,
                    paddingTop: 10,
                    // Ensure content doesn't get clipped by rounded corners on Android if needed
                    overflow: 'hidden',
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    marginTop: 0,
                },
                tabBarPressColor: 'transparent',
                tabBarShowIcon: true,
                tabBarIconStyle: {
                    width: 30,
                    height: 30,
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
