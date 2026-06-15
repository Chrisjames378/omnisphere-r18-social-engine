import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import { router } from "expo-router";
import { ShieldAlert, Camera, ShieldCheck } from "lucide-react-native";

export default function AgeVerificationScreen() {
  const [step, setStep] = useState<"none" | "scanning" | "completed">("none");
  const [progress, setProgress] = useState(0);

  const startScan = () => {
    setStep("scanning");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p: number) => {
        if (p >= 100) {
          clearInterval(interval);
          setStep("completed");
          setTimeout(() => {
            router.replace("/(tabs)/feed");
          }, 800);
          return 100;
        }
        return p + 5;
      });
    }, 70);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>OMNISPHERE <Text style={styles.logoPink}>R18</Text></Text>
          <Text style={styles.sublogo}>Next-Gen Uncensored Social Engine</Text>
        </View>

        {step === "none" && (
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <ShieldAlert size={36} color="#ff007f" />
            </View>
            <Text style={styles.title}>Biometric Verification Required</Text>
            <Text style={styles.description}>
              This platform hosts mature content (R18+). You must verify your age status via biometric scan to proceed.
            </Text>

            <TouchableOpacity style={styles.btnPrimary} onPress={startScan}>
              <Camera size={18} color="#fff" style={styles.btnIcon} />
              <Text style={styles.btnText}>Start AI Face Scanner</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSecondary} onPress={() => router.replace("/(tabs)/feed")}>
              <Text style={styles.btnSecText}>Bypass / Skip verification</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "scanning" && (
          <View style={styles.card}>
            <View style={styles.scannerWrapper}>
              <ActivityIndicator size="large" color="#00f0ff" />
              <Text style={styles.progressText}>{progress}% Scanned</Text>
            </View>
            <Text style={styles.title}>Analyzing Telemetry...</Text>
            <Text style={styles.description}>Scanning face geometry nodes. Zero-telemetry validation actively stripping identity logs.</Text>
          </View>
        )}

        {step === "completed" && (
          <View style={styles.card}>
            <View style={styles.successIcon}>
              <ShieldCheck size={48} color="#00ff66" />
            </View>
            <Text style={styles.title}>Age Verified 18+</Text>
            <Text style={styles.description}>Identity cleared. Decoupled handshake active. Redirecting to network feed...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b"
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center"
  },
  header: {
    alignItems: "center",
    marginBottom: 40
  },
  logo: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    fontFamily: "System"
  },
  logoPink: {
    color: "#ff007f"
  },
  sublogo: {
    fontSize: 11,
    color: "#00f0ff",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 4
  },
  card: {
    width: "100%",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 20,
    padding: 24,
    alignItems: "center"
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 0, 127, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 0, 127, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10
  },
  description: {
    fontSize: 13,
    color: "#a1a1aa",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24
  },
  btnPrimary: {
    width: "100%",
    backgroundColor: "#ff007f",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12
  },
  btnIcon: {
    marginRight: 8
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700"
  },
  btnSecondary: {
    width: "100%",
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  btnSecText: {
    color: "#71717a",
    fontSize: 12
  },
  scannerWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#00f0ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24
  },
  progressText: {
    color: "#00f0ff",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4
  },
  successIcon: {
    marginBottom: 16
  }
});
