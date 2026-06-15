import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert
} from "react-native";
import {
  Wallet,
  Coins,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Settings
} from "lucide-react-native";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "tip" | "subscription";
  amount: number;
  description: string;
  time: string;
}

export default function WalletScreen() {
  const [balance, setBalance] = useState(150.00);
  const [depositAmount, setDepositAmount] = useState("100");
  const [withdrawAmount, setWithdrawAmount] = useState("50");
  const [subPrice, setSubPrice] = useState("9.99");
  
  // Seed transactions
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "tx-1",
      type: "deposit",
      amount: 150.00,
      description: "Initial wallet seed",
      time: "10:30 AM"
    },
    {
      id: "tx-2",
      type: "tip",
      amount: 15.00,
      description: "Tip from @user_anon",
      time: "09:15 AM"
    },
    {
      id: "tx-3",
      type: "subscription",
      amount: 9.99,
      description: "Subscription unlock @cyber_vixen",
      time: "Yesterday"
    }
  ]);

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid deposit amount.");
      return;
    }
    setBalance(prev => prev + amt);
    const newTx: Transaction = {
      id: `tx-dep-${Date.now()}`,
      type: "deposit",
      amount: amt,
      description: "Simulated Token Deposit",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTransactions(prev => [newTx, ...prev]);
    Alert.alert("Deposit Success", `Successfully deposited $${amt.toFixed(2)} tokens!`);
  };

  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid withdrawal amount.");
      return;
    }
    if (balance < amt) {
      Alert.alert("Insufficient Balance", "You do not have enough tokens for this withdrawal.");
      return;
    }
    setBalance(prev => prev - amt);
    const newTx: Transaction = {
      id: `tx-wth-${Date.now()}`,
      type: "withdrawal",
      amount: amt,
      description: "Simulated Cash Withdrawal",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTransactions(prev => [newTx, ...prev]);
    Alert.alert("Withdrawal Success", `Successfully withdrew $${amt.toFixed(2)} tokens!`);
  };

  const handleUpdatePrice = () => {
    const price = parseFloat(subPrice);
    if (isNaN(price) || price < 0) {
      Alert.alert("Invalid Price", "Please enter a valid subscription price.");
      return;
    }
    Alert.alert("Settings Updated", `Your creator subscription price is updated to $${price.toFixed(2)}/mo`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet & Billing</Text>
        <Wallet size={18} color="#ff007f" />
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Balance Card with Cyber Fuchsia theme */}
        <View style={styles.balanceCard}>
          <View style={styles.glowOverlay} />
          <Text style={styles.balanceLabel}>TOTAL AVAILABLE BALANCE</Text>
          <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
          
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>DECEN-DEPOSIT ENABLED</Text>
            </View>
            <Text style={styles.badgeSub}>95% Payout rate active</Text>
          </View>
        </View>

        {/* Creator Stats Analytics */}
        <Text style={styles.sectionTitle}>CREATOR METRICS</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Subscribers</Text>
              <Users size={16} color="#ff007f" />
            </View>
            <Text style={styles.statValue}>1,482</Text>
            <View style={styles.trendRow}>
              <TrendingUp size={10} color="#00f0ff" style={styles.trendIcon} />
              <Text style={styles.trendText}>+12.4% this mo</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Monthly Rev</Text>
              <DollarSign size={16} color="#8a2be2" />
            </View>
            <Text style={styles.statValue}>$14,805</Text>
            <View style={styles.trendRow}>
              <TrendingUp size={10} color="#00f0ff" style={styles.trendIcon} />
              <Text style={styles.trendText}>+8.1% this mo</Text>
            </View>
          </View>
        </View>

        {/* Creator Price Setting */}
        <View style={styles.actionCard}>
          <Text style={styles.cardTitle}>Subscription Price Setting</Text>
          <Text style={styles.cardDesc}>Set the cost for users to unlock your premium feed.</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={styles.priceInput}
                value={subPrice}
                onChangeText={setSubPrice}
                keyboardType="numeric"
                placeholder="9.99"
                placeholderTextColor="#3f3f46"
              />
            </View>
            <TouchableOpacity style={styles.priceBtn} onPress={handleUpdatePrice}>
              <Settings size={14} color="#fff" style={styles.btnIcon} />
              <Text style={styles.priceBtnText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Deposit Operations */}
        <View style={styles.actionCard}>
          <Text style={styles.cardTitle}>Simulated Token Deposit</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.actionInput}
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="numeric"
              placeholder="Amount to deposit"
              placeholderTextColor="#3f3f46"
            />
            <TouchableOpacity style={styles.depositBtn} onPress={handleDeposit}>
              <ArrowUpRight size={14} color="#000" style={styles.btnIcon} />
              <Text style={styles.depositBtnText}>Deposit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Withdrawal Operations */}
        <View style={styles.actionCard}>
          <Text style={styles.cardTitle}>Simulated Cash Withdrawal</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.actionInput}
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="numeric"
              placeholder="Amount to withdraw"
              placeholderTextColor="#3f3f46"
            />
            <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw}>
              <ArrowDownLeft size={14} color="#fff" style={styles.btnIcon} />
              <Text style={styles.withdrawBtnText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction Ledger */}
        <Text style={styles.sectionTitle}>TRANSACTION LEDGER</Text>
        <View style={styles.ledgerCard}>
          {transactions.map((tx: Transaction) => {
            const isCredit = tx.type === "deposit" || tx.type === "tip";
            return (
              <View key={tx.id} style={styles.ledgerRow}>
                <View style={styles.ledgerLeft}>
                  <Text style={styles.ledgerDesc}>{tx.description}</Text>
                  <Text style={styles.ledgerTime}>{tx.time}</Text>
                </View>
                <View style={styles.ledgerRight}>
                  <Text style={[styles.ledgerAmount, isCredit ? styles.amountGreen : styles.amountPink]}>
                    {isCredit ? "+" : "-"}${tx.amount.toFixed(2)}
                  </Text>
                  <View style={[styles.ledgerTypeBadge, styles[`badge_${tx.type}`]]}>
                    <Text style={styles.ledgerTypeText}>{tx.type}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
  scrollContainer: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  balanceCard: {
    backgroundColor: "#ff007f",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    position: "relative",
    overflow: "hidden"
  },
  glowOverlay: {
    position: "absolute",
    right: -20,
    bottom: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(138, 43, 226, 0.4)",
    opacity: 0.8
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 1.5
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    marginTop: 8,
    fontFamily: "System"
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 10
  },
  badgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8
  },
  badgeSub: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 10
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#71717a",
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 8
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24
  },
  statBox: {
    flex: 1,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 16,
    padding: 16
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  statLabel: {
    color: "#a1a1aa",
    fontSize: 11,
    fontWeight: "600"
  },
  statValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "System"
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6
  },
  trendIcon: {
    marginRight: 4
  },
  trendText: {
    color: "#00f0ff",
    fontSize: 10,
    fontWeight: "bold"
  },
  actionCard: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  cardTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12
  },
  cardDesc: {
    color: "#71717a",
    fontSize: 11,
    marginBottom: 12,
    marginTop: -8
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  priceInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#09090b",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#27272a",
    paddingLeft: 12
  },
  currencyPrefix: {
    color: "#71717a",
    fontWeight: "bold",
    marginRight: 4,
    fontSize: 13
  },
  priceInput: {
    flex: 1,
    height: 40,
    color: "#fff",
    fontSize: 13,
    fontFamily: "System"
  },
  priceBtn: {
    backgroundColor: "#ff007f",
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },
  priceBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold"
  },
  actionInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#09090b",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#27272a",
    paddingHorizontal: 12,
    color: "#fff",
    fontSize: 13,
    fontFamily: "System"
  },
  depositBtn: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },
  depositBtnText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold"
  },
  withdrawBtn: {
    backgroundColor: "#18181b",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#27272a",
    paddingHorizontal: 16,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },
  withdrawBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold"
  },
  btnIcon: {
    marginRight: 6
  },
  ledgerCard: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 16,
    overflow: "hidden"
  },
  ledgerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a"
  },
  ledgerLeft: {
    flex: 1,
    marginRight: 10
  },
  ledgerDesc: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600"
  },
  ledgerTime: {
    color: "#71717a",
    fontSize: 10,
    marginTop: 4
  },
  ledgerRight: {
    alignItems: "flex-end"
  },
  ledgerAmount: {
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "System",
    marginBottom: 4
  },
  amountGreen: {
    color: "#00ff66"
  },
  amountPink: {
    color: "#ff007f"
  },
  ledgerTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  ledgerTypeText: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase"
  },
  badge_deposit: {
    backgroundColor: "rgba(0, 255, 102, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 102, 0.2)"
  },
  badge_withdrawal: {
    backgroundColor: "rgba(113, 113, 122, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(113, 113, 122, 0.2)"
  },
  badge_tip: {
    backgroundColor: "rgba(255, 0, 127, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 0, 127, 0.2)"
  },
  badge_subscription: {
    backgroundColor: "rgba(138, 43, 226, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(138, 43, 226, 0.2)"
  }
});
