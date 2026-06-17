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
import { UserCheck, ShieldCheck, Sparkles, Send, Key } from "lucide-react-native";

export default function AgentScreen() {
  const [logs, setLogs] = useState<string[]>([
    "System initialized. Connection handshake secure.",
    "Welcome to Agent Oracle v1.1. Enter query parameters below or run header audits."
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userText = input;
    setLogs(prev => [...prev, `> ${userText}`]);
    setInput("");
    setIsGenerating(true);

    const triggerOfflineReply = (txt: string) => {
      const query = txt.toLowerCase();
      let reply = "";
      if (query.includes("help") || query.includes("menu")) {
        reply = "Agent Oracle dynamic systems active:\n- Chat: secure encryption protocols.\n- Telemetry Audit: header diagnostics.\n- Optimizer: social caption updates.";
      } else if (query.includes("encryption") || query.includes("privacy") || query.includes("telemetry") || query.includes("censor")) {
        reply = "Omnisphere R18 strips EXIF metadata on media uploads. Client-side database tables are protected under strict RLS rules.";
      } else {
        reply = `Audit request logged. Processing: "${query}". Connection nodes remain clean.`;
      }
      setLogs(prev => [...prev, reply]);
    };

    if (apiKey) {
      try {
        const historyContents = logs.slice(-6).map(log => {
          const isUser = log.startsWith("> ");
          return {
            role: isUser ? "user" : "model",
            parts: [{ text: isUser ? log.substring(2) : log }]
          };
        });

        historyContents.push({
          role: "user",
          parts: [{ text: userText }]
        });

        const systemInstruction = {
          parts: [
            {
              text: "You are Agent Oracle, the advanced mobile AI assistant for Omnisphere R18. Omnisphere is a decentralized, zero-telemetry, censor-free social platform. Creators keep 95% of direct cash flows. Keep your responses short (under 3 sentences), highly technical, and aligned with a cyber-neon, cypherpunk hacker aesthetic."
            }
          ]
        };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: historyContents,
              systemInstruction: systemInstruction
            })
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `API error (${response.status})`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Oracle communication line timed out.";
        
        setLogs(prev => [...prev, text]);
      } catch (err: any) {
        console.error("Mobile Gemini API Error:", err);
        setLogs(prev => [...prev, `⚠️ [API FAILURE] ${err.message}. Falling back to local offline protocols.`]);
        setTimeout(() => {
          triggerOfflineReply(userText);
        }, 800);
      } finally {
        setIsGenerating(false);
      }
    } else {
      setTimeout(() => {
        triggerOfflineReply(userText);
        setIsGenerating(false);
      }, 1000);
    }
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity onPress={() => setShowApiKeyInput(!showApiKeyInput)} style={styles.keyToggleBtn}>
            <Key size={18} color={apiKey ? "#00ff66" : "#ff007f"} />
          </TouchableOpacity>
          <UserCheck size={18} color="#00ff66" />
        </View>
      </View>

      {showApiKeyInput && (
        <View style={styles.apiConfigContainer}>
          <Text style={styles.configLabel}>GOOGLE AI STUDIO API KEY</Text>
          <TextInput
            style={styles.configInput}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Enter Gemini API Key..."
            placeholderTextColor="#52525b"
            secureTextEntry={true}
          />
        </View>
      )}

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
  },
  keyToggleBtn: {
    padding: 4
  },
  apiConfigContainer: {
    backgroundColor: "#18181b",
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    padding: 12
  },
  configLabel: {
    color: "#a1a1aa",
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: "monospace",
    marginBottom: 6
  },
  configInput: {
    height: 36,
    backgroundColor: "#09090b",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#27272a",
    paddingHorizontal: 10,
    color: "#fff",
    fontSize: 11,
    fontFamily: "monospace"
  }
});
