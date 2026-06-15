import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView
} from "react-native";
import { MessageSquare, ChevronRight } from "lucide-react-native";

interface ChatThread {
  id: string;
  creator: string;
  avatar: string;
  lastMsg: string;
}

const CHAT_THREADS: ChatThread[] = [
  {
    id: "1",
    creator: "Vixen Noir",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    lastMsg: "Thanks for supporting! Synthesizer loop haptics mix is finishing tonight."
  },
  {
    id: "2",
    creator: "PixelGhost",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    lastMsg: "Let me know what custom 3D mesh model you need for commission!"
  }
];

export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Direct Messages</Text>
        <MessageSquare size={18} color="#8a2be2" />
      </View>

      <FlatList
        data={CHAT_THREADS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.threadCard}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.meta}>
              <Text style={styles.creatorName}>{item.creator}</Text>
              <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMsg}</Text>
            </View>
            <ChevronRight size={16} color="#71717a" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b"
  },
  header: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff"
  },
  list: {
    padding: 16
  },
  threadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 16,
    marginBottom: 12
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  meta: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8
  },
  creatorName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4
  },
  lastMsg: {
    color: "#71717a",
    fontSize: 12
  }
});
