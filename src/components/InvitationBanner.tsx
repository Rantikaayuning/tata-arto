import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useExpenseStore from "../context/useExpenseStore";

export default function InvitationBanner() {
  const { pendingInvitationsForMe, acceptInvitation, declineInvitation } = useExpenseStore();
  const [isLoading, setIsLoading] = useState(false);

  if (!pendingInvitationsForMe || pendingInvitationsForMe.length === 0) {
    return null;
  }

  const invitation = pendingInvitationsForMe[0];
  const totalInvitations = pendingInvitationsForMe.length;

  const inviterName = invitation.inviter?.full_name || "Seseorang";
  const familyName = invitation.families?.name || "Keluarga";

  const handleAccept = async () => {
    Alert.alert(
      "Bergabung dengan Keluarga",
      "Perhatian: Data keuangan pribadi Anda (dompet, kategori, pengeluaran) akan DIHAPUS dan digantikan dengan data dari keluarga yang baru. Lanjutkan?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Bergabung",
          onPress: async () => {
            setIsLoading(true);
            const { success, message } = await acceptInvitation(invitation.id, invitation.family_id);
            setIsLoading(false);
            if (!success) {
              Alert.alert("Gagal", message);
            } else {
              Alert.alert("Berhasil", message);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleDecline = async () => {
    Alert.alert(
      "Tolak Undangan",
      `Apakah Anda yakin ingin menolak undangan dari ${familyName}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Tolak",
          onPress: async () => {
            setIsLoading(true);
            await declineInvitation(invitation.id);
            setIsLoading(false);
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {totalInvitations > 1 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>1 dari {totalInvitations} undangan</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail" size={24} color="#4f46e5" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Undangan Bergabung</Text>
          <Text style={styles.description}>
            <Text style={styles.bold}>{inviterName}</Text> mengundang Anda ke <Text style={styles.bold}>{familyName}</Text>.
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.declineButton]}
          onPress={handleDecline}
          disabled={isLoading}
        >
          <Text style={styles.declineButtonText}>Tolak</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={handleAccept}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.acceptButtonText}>Bergabung</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  badge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: "#4f46e5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  bold: {
    fontWeight: "700",
    color: "#111827",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  declineButton: {
    backgroundColor: "#f3f4f6",
  },
  declineButtonText: {
    color: "#4b5563",
    fontWeight: "600",
    fontSize: 14,
  },
  acceptButton: {
    backgroundColor: "#4f46e5",
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
