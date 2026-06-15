import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView
} from "react-native";
import { Sparkles, Heart, MessageSquare, Lock, Unlock } from "lucide-react-native";

interface Post {
  id: string;
  creator: string;
  avatar: string;
  content: string;
  likes: number;
  isLocked: boolean;
  isUnlocked: boolean;
}

const SEED_POSTS: Post[] = [
  {
    id: "1",
    creator: "Vixen Noir",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    content: "Studio synth haptic testing loops. Teaser files loaded below! Sub to unlock.",
    likes: 84,
    isLocked: true,
    isUnlocked: false
  },
  {
    id: "2",
    creator: "PixelGhost",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    content: "Completed Blender neon shader setup. Render output preview.",
    likes: 129,
    isLocked: false,
    isUnlocked: true
  }
];

export default function FeedScreen() {
  const [posts, setPosts] = useState(SEED_POSTS);

  const handleSubscribe = (id: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, isUnlocked: true } : p))
    );
    alert("Subscription activated!");
  };

  const handleLike = (id: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Uncensored Feed</Text>
        <Sparkles size={18} color="#ff007f" />
      </View>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const showLocked = item.isLocked && !item.isUnlocked;

          return (
            <View style={styles.postCard}>
              {/* Card Header */}
              <View style={styles.postHeader}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.creatorMeta}>
                  <Text style={styles.creatorName}>{item.creator}</Text>
                  <Text style={styles.badge}>CREATOR</Text>
                </View>
              </View>

              {/* Card Content Gated */}
              {showLocked ? (
                <View style={styles.lockedContainer}>
                  <Lock size={24} color="#ff007f" style={styles.lockIcon} />
                  <Text style={styles.lockedTitle}>Locked Premium Content</Text>
                  <Text style={styles.lockedDesc}>Subscribe to unlock exclusive media archives.</Text>
                  <TouchableOpacity style={styles.btnLock} onPress={() => handleSubscribe(item.id)}>
                    <Text style={styles.btnLockText}>Subscribe for $9.99/mo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.unlockedContainer}>
                  <Text style={styles.postContent}>{item.content}</Text>
                  {item.isLocked && (
                    <View style={styles.unlockedBadge}>
                      <Unlock size={12} color="#00f0ff" style={styles.btnIcon} />
                      <Text style={styles.unlockedBadgeText}>Unlocked</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Actions Footer */}
              <View style={styles.postFooter}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id)}>
                  <Heart size={16} color="#71717a" style={styles.btnIcon} />
                  <Text style={styles.actionText}>{item.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn}>
                  <MessageSquare size={16} color="#71717a" style={styles.btnIcon} />
                  <Text style={styles.actionText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
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
  postCard: {
    backgroundColor: "#18181b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    marginBottom: 16,
    overflow: "hidden"
  },
  postHeader: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center"
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19
  },
  creatorMeta: {
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center"
  },
  creatorName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14
  },
  badge: {
    fontSize: 9,
    fontWeight: "800",
    color: "#ff007f",
    backgroundColor: "rgba(255, 0, 127, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 0, 127, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8
  },
  postContent: {
    color: "#d4d4d8",
    fontSize: 13,
    lineHeight: 18
  },
  unlockedContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  lockedContainer: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#09090b",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#27272a"
  },
  lockIcon: {
    marginBottom: 8
  },
  lockedTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 4
  },
  lockedDesc: {
    color: "#71717a",
    fontSize: 11,
    marginBottom: 16
  },
  btnLock: {
    backgroundColor: "#ff007f",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  btnLockText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold"
  },
  postFooter: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(39, 39, 42, 0.4)",
    backgroundColor: "rgba(24, 24, 27, 0.4)"
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24
  },
  btnIcon: {
    marginRight: 6
  },
  actionText: {
    color: "#71717a",
    fontSize: 12,
    fontWeight: "600"
  },
  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8
  },
  unlockedBadgeText: {
    color: "#00f0ff",
    fontSize: 11,
    fontWeight: "bold"
  }
});
