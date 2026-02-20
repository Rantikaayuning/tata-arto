import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import useExpenseStore from '../context/useExpenseStore';

const MembersScreen = ({ navigation }: any) => {
    const members = useExpenseStore((state) => state.members) || [];
    const addMember = useExpenseStore((state) => state.addMember);
    const currentUser = useExpenseStore((state) => state.user);
    const logout = useExpenseStore((state) => state.logout);

    const [modalVisible, setModalVisible] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');

    const handleInvite = () => {
        if (!newMemberName || !newMemberEmail) return;

        addMember({
            id: Date.now().toString(),
            name: newMemberName,
            email: newMemberEmail,
            role: 'member',
            avatar: 'person-outline'
        });

        setNewMemberName('');
        setNewMemberEmail('');
        setModalVisible(false);
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Apakah Anda yakin ingin keluar?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Keluar",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'MainTabs' }],
                        });
                    }
                }
            ]
        );
    };

    const renderMember = ({ item }: any) => (
        <View className="flex-row items-center bg-white p-4 mb-3 rounded-3xl border border-gray-100 shadow-sm">
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${item.role === 'admin' ? 'bg-primary/10' : 'bg-orange-50'}`}>
                <Ionicons
                    name={item.avatar as any || 'person'}
                    size={20}
                    color={item.role === 'admin' ? '#343B71' : '#F97316'}
                />
            </View>
            <View className="flex-1">
                <Text className="font-bold text-gray-800 text-base">{item.name} {item.id === currentUser?.id ? '(Saya)' : ''}</Text>
                <Text className="text-gray-400 text-xs">{item.email}</Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${item.role === 'admin' ? 'bg-primary' : 'bg-gray-100'}`}>
                <Text className={`text-xs font-bold ${item.role === 'admin' ? 'text-white' : 'text-gray-500'}`}>
                    {item.role === 'admin' ? 'Pemilik' : 'Anggota'}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#F7F8FA]" edges={['top', 'left', 'right']}>
            <View className="px-6 pt-4 pb-4 bg-white border-b border-gray-100 shadow-sm z-10 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 -ml-2 rounded-full active:bg-gray-50">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-extrabold text-primary tracking-tighter">Anggota Keluarga</Text>
                        <Text className="text-xs text-gray-500 font-medium">Kelola akses dan pemantauan</Text>
                    </View>
                </View>
            </View>

            <View className="flex-1 px-6 pt-6">
                {/* Current User Card */}
                {currentUser && (
                    <View className="mb-8">
                        <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-3 pl-1">Login Sebagai</Text>
                        <View className="bg-primary p-5 rounded-[24px] shadow-lg shadow-indigo-500/30 flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                                <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center border border-white/10 mr-4">
                                    <Ionicons name="person" size={24} color="white" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-lg">{currentUser.name}</Text>
                                    <Text className="text-indigo-200 text-sm">{currentUser.email}</Text>
                                    <View className="bg-white/20 px-2 py-0.5 rounded-md self-start mt-2">
                                        <Text className="text-white text-[10px] font-bold uppercase">Sedang Aktif</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={handleLogout}
                                className="bg-rose-500 p-3 rounded-xl ml-2 shadow-sm active:scale-95"
                            >
                                <Ionicons name="log-out-outline" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View className="mb-6 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex-row items-start">
                    <Ionicons name="information-circle" size={20} color="#343B71" style={{ marginTop: 2 }} />
                    <Text className="ml-3 text-indigo-900 leading-5 flex-1 text-sm">
                        Anggota yang ditambahkan dapat melihat dan mengubah catatan keuangan ini bersama-sama.
                    </Text>
                </View>

                <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-3 pl-1">Daftar Anggota</Text>
                <FlatList
                    data={members}
                    keyExtractor={item => item.id}
                    renderItem={renderMember}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            <View className="absolute bottom-10 right-6 left-6">
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-indigo-500/30"
                >
                    <Ionicons name="person-add" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Undang Anggota</Text>
                </TouchableOpacity>
            </View>

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/60 px-6">
                    <View className="bg-white rounded-[32px] p-8 w-full shadow-2xl">
                        <View className="flex-row justify-between items-center mb-8">
                            <Text className="text-2xl font-bold text-gray-800">Undang Anggota</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-gray-50 rounded-full">
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-2">Nama</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 font-bold text-gray-800"
                            placeholder="Nama Panggilan"
                            value={newMemberName}
                            onChangeText={setNewMemberName}
                        />

                        <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-2">Email</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 font-bold text-gray-800"
                            placeholder="alamat@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={newMemberEmail}
                            onChangeText={setNewMemberEmail}
                        />

                        <TouchableOpacity
                            onPress={handleInvite}
                            className="bg-primary py-4 rounded-2xl items-center shadow-lg"
                        >
                            <Text className="text-white font-bold text-lg">Kirim Undangan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default MembersScreen;
