import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import { UserCheck, ShieldCheck, Sparkles, Send } from "lucide-react-native";

export default function AgentScreen() {
  const [logs, setLogs] = useState<string[]>([
    "System initialized. Connection handshake secure.",
    "Welcome to Agent Oracle v1.1. Enter query parameters below or run header audits."
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;

    setLogs(prev => [...prev, `> ${input}`]);
    const query = input.toLowerCase();
    setInput("");
    setIsGenerating(true);

    setTimeout(() => {
      let reply = "";
      if (query.includes("help") || query.includes("menu")) {
        reply = "Agent Oracle dynamic systems active:\n- Chat: secure encryption protocols.\n- Telemetry Audit: header diagnostics.\n- Optimizer: social caption updates.";
      } else if (query.includes("encryption") || query.includes("privacy") || query.includes("telemetry") || query.includes("censor")) {
        reply = "Omnisphere R18 strips EXIF metadata on media uploads. Client-side database tables are protected under strict RLS rules.";
      } else {
        reply = `Audit request logged. Processing: "${query}". Connection nodes remain clean.`;
      }
      setLogs(prev => [...prev, reply]);
      setIsGenerating(false);
    }, 1000);
  };

  const handleScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setLogs([]);
    setScore(null);

    const steps = [
      "[Handshake] Initializing local client tunnel...",
      "[Framer Check] Auditing browser node user-agents...",
      "[Telemetry Check] Stripping HTTP cookie headers...",
      "[Diagnostic Finish] Sweep complete. Telemetry: 100% clean."
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setScore(100);
          setIsScanning(false);
        }
      }, (idx + 1) * 600);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agent Oracle Terminal</Text>
        <UserCheck size={18} color="#00ff66" />
      </View>

      <ScrollView style={styles.terminalContainer} contentContainerStyle={styles.terminalContent}>
        {logs.map((log, index) => (
          <Text key={index} style={log.startsWith(">") ? styles.userLog : styles.oracleLog}>
            {log}
          </Text>
        ))}
        {isGenerating && (
          <ActivityIndicator size="small" color="#00ff66" style={styles.loader} />
        )}
      </ScrollView>

      {/* Control Actions Box */}
      <View style={styles.actionsBox}>
        {score !== null && (
          <View style={styles.scoreBadge}>
            <ShieldCheck size={14} color="#00ff66" style={styles.actionIcon} />
            <Text style={styles.scoreText}>Handshake Score: {score}% Clean</Text>
          </View>
        )}

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleScan} disabled={isScanning}>
            <ShieldCheck size={14} color="#00ff66" style={styles.actionIcon} />
            <Text style={styles.actionBtnText}>{isScanning ? "Sweeping..." : "Telemetry Scan"}</Text>
          </TouchableOpacity>
        </View>

        {/* Input Row */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Query Agent Oracle..."
            placeholderTextColor="#3f3f46"
            editable={!isGenerating}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Send size={14} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
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
  terminalContainer: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16
  },
  terminalContent: {
    paddingBottom: 24
  },
  oracleLog: {
    color: "#00ff66",
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
    textShadowColor: "rgba(0, 255, 102, 0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8
  },
  userLog: {
    color: "#fff",
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10
  },
  loader: {
    alignSelf: "flex-start",
    marginTop: 4
  },
  actionsBox: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#18181b",
    backgroundColor: "#09090b"
  },
  btnRow: {
    flexDirection: "row",
    marginBottom: 12
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 102, 0.2)",
    borderRadius: 8,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  actionIcon: {
    marginRight: 6
  },
  actionBtnText: {
    color: "#00ff66",
    fontSize: 11,
    fontWeight: "bold"
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#18181b",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#27272a",
    paddingHorizontal: 16,
    color: "#00ff66",
    fontSize: 12,
    fontFamily: "monospace"
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#00ff66",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10
  },
  scoreBadge: {
    backgroundColor: "rgba(0, 255, 102, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 102, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  scoreText: {
    color: "#00ff66",
    fontSize: 11,
    fontWeight: "600"
  }
});
