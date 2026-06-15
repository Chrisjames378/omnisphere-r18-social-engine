import { Tabs } from "expo-router";
import { Sparkles, MessageSquare, Wallet, UserCheck } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { 
          backgroundColor: "#18181b", 
          borderTopColor: "#27272a" 
        },
        tabBarActiveTintColor: "#ff007f",
        tabBarInactiveTintColor: "#71717a",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color }) => <Sparkles size={20} color={color} />
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => <MessageSquare size={20} color={color} />
        }}
      />
      <Tabs.Screen
        name="agent"
        options={{
          title: "Oracle",
          tabBarIcon: ({ color }) => <UserCheck size={20} color={color} />
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color }) => <Wallet size={20} color={color} />
        }}
      />
    </Tabs>
  );
}
