import { useState, useEffect, useRef } from "react";
import { initSupabase, getSupabase } from "./supabaseClient";
import {
  ShieldAlert,
  Lock,
  Unlock,
  MessageSquare,
  Send,
  Wallet,
  DollarSign,
  TrendingUp,
  Users,
  Award,
  Image as ImageIcon,
  Heart,
  Camera,
  CheckCircle,
  Sparkles,
  LockKeyhole,
  Coins,
  Flame,
  ShieldCheck,
  Database,
  UserCheck
} from "lucide-react";

// Types
interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  cover_url: string;
  bio: string;
  is_creator: boolean;
  subscription_price: number;
  wallet_balance: number;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  is_locked: boolean;
  likes_count: number;
  created_at: string;
  liked_by_user?: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  media_url?: string;
  created_at: string;
}

interface Transaction {
  id: string;
  sender_id: string | null;
  receiver_id: string | null;
  amount: number;
  tx_type: "tip" | "subscription" | "deposit" | "withdrawal";
  description: string;
  created_at: string;
}

interface WaitlistEntry {
  id: string;
  email: string;
  handle: string;
  category: string;
  created_at: string;
}

// Initial Mock/Seed Data
const INITIAL_PROFILES: Profile[] = [
  {
    id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    username: "cyber_vixen",
    display_name: "Vixen Noir",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    cover_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    bio: "Alternative fashion model and electronic synth-pop musician. Uncensored lifestyle logs & daily music jams.",
    is_creator: true,
    subscription_price: 9.99,
    wallet_balance: 2450.00
  },
  {
    id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
    username: "pixel_ghost",
    display_name: "PixelGhost",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    cover_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    bio: "Independent photorealistic digital artist & 3D animator. Custom commissions. Sub for raw work-in-progress files.",
    is_creator: true,
    subscription_price: 14.99,
    wallet_balance: 1890.00
  },
  {
    id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
    username: "shadow_scribe",
    display_name: "ShadowScribe",
    avatar_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80",
    cover_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    bio: "Underground investigative journalist. Ad-free, censor-free exposure of data harvesting conglomerates.",
    is_creator: true,
    subscription_price: 5.00,
    wallet_balance: 420.00
  },
  {
    id: "currentUser",
    username: "user_anon",
    display_name: "Crypto Knight",
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
    cover_url: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80",
    bio: "Cybersecurity enthusiast and early adopter. Anonymity is my shield.",
    is_creator: false,
    subscription_price: 0.00,
    wallet_balance: 150.00
  }
];

const INITIAL_POSTS: Post[] = [
  {
    id: "post-1",
    user_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    content: "Late night synth sessions in the studio. Here is a teaser of my upcoming single: 'Midnight Static'. Full high-quality audio is unlocked for my subscribers below!",
    media_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    is_locked: false,
    likes_count: 84,
    created_at: "2026-06-15T22:30:00Z"
  },
  {
    id: "post-2",
    user_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    content: "Behind-the-scenes photoshoot from last night's industrial warehouse session. Uncensored, unfiltered, direct to you. Sub to unlock the full 8K album.",
    media_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    is_locked: true,
    likes_count: 142,
    created_at: "2026-06-15T20:15:00Z"
  },
  {
    id: "post-3",
    user_id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
    content: "Rendering my latest abstract cyber-neon artwork. Took 38 hours to complete. Feel free to download for personal wallpaper use!",
    media_url: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
    is_locked: false,
    likes_count: 203,
    created_at: "2026-06-15T18:45:00Z"
  },
  {
    id: "post-4",
    user_id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
    content: "Exclusive 3D assets and blender file download link. Includes raw textures and lighting setups.",
    media_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    is_locked: true,
    likes_count: 55,
    created_at: "2026-06-15T15:00:00Z"
  },
  {
    id: "post-5",
    user_id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
    content: "A quick update: Next document dump exposes metadata brokerage chains in the EU. Stay tuned.",
    is_locked: false,
    likes_count: 394,
    created_at: "2026-06-15T12:00:00Z"
  },
  {
    id: "post-6",
    user_id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
    content: "UNLOCKED: The Complete PDF Dossier outlining metadata transactions of major telemetry groups. Direct download.",
    media_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    is_locked: true,
    likes_count: 892,
    created_at: "2026-06-15T09:30:00Z"
  }
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg-1",
    sender_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    receiver_id: "currentUser",
    content: "Hey Crypto Knight! Thanks for the sub. I'm finishing the raw mix for the synth track tonight.",
    created_at: "2026-06-15T22:35:00Z"
  },
  {
    id: "msg-2",
    sender_id: "currentUser",
    receiver_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    content: "That sounds awesome! Can't wait to hear the full version.",
    created_at: "2026-06-15T22:40:00Z"
  }
];

function BiometricScannerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = 180;
    let height = canvas.height = 180;

    const particles: { x: number; y: number; vx: number; vy: number }[] = [];
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2, 55, 75, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width / 2 - 8, height / 2);
      ctx.lineTo(width / 2 + 8, height / 2);
      ctx.moveTo(width / 2, height / 2 - 8);
      ctx.lineTo(width / 2, height / 2 + 8);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 0, 127, 0.75)";
      ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 40) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      ctx.fillStyle = "#00f0ff";
      ctx.font = "8px monospace";
      ctx.fillText("[MAPPING FACIAL NODES]", 12, 20);
      ctx.fillText(`[CONFIDENCE: ${(98.1 + Math.random() * 1.4).toFixed(1)}%]`, 12, height - 12);

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full object-cover rounded-full" />;
}

export default function App() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<"feed" | "messages" | "studio" | "wallet" | "waitlist" | "agent">("feed");
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(() => {
    return localStorage.getItem("omni_verified") === "true";
  });

  // Melody Synth Teaser & Visualizer States
  const [isPlayingSynth, setIsPlayingSynth] = useState(false);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(Array(24).fill(15));
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<any[]>([]);

  const stopSynth = () => {
    setIsPlayingSynth(false);
    activeOscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    activeOscillatorsRef.current = [];
    setVisualizerBars(Array(24).fill(15));
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch(e){}
      audioCtxRef.current = null;
    }
  };

  const handlePlaySynth = () => {
    if (isPlayingSynth) {
      stopSynth();
      return;
    }
    
    setIsPlayingSynth(true);
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      
      const now = ctx.currentTime;
      
      const melody = [
        { note: 130.81, time: 0.0 }, // C3
        { note: 261.63, time: 0.2 }, // C4
        { note: 196.00, time: 0.4 }, // G3
        { note: 392.00, time: 0.6 }, // G4
        { note: 155.56, time: 0.8 }, // Eb3
        { note: 311.13, time: 1.0 }, // Eb4
        { note: 233.08, time: 1.2 }, // Bb3
        { note: 466.16, time: 1.4 }, // Bb4
        
        { note: 130.81, time: 1.6 }, // C3
        { note: 261.63, time: 1.8 }, // C4
        { note: 196.00, time: 2.0 }, // G3
        { note: 392.00, time: 2.2 }, // G4
        { note: 155.56, time: 2.4 }, // Eb3
        { note: 311.13, time: 2.6 }, // Eb4
        { note: 233.08, time: 2.8 }, // Bb3
        { note: 466.16, time: 3.0 }  // Bb4
      ];
      
      const duration = 0.18;
      
      melody.forEach((item) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gainNode = ctx.createGain();
        
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(item.note, now + item.time);
        
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(900, now + item.time);
        filter.frequency.exponentialRampToValueAtTime(150, now + item.time + duration);
        
        gainNode.gain.setValueAtTime(0.0, now + item.time);
        gainNode.gain.linearRampToValueAtTime(0.12, now + item.time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + item.time + duration);
        
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now + item.time);
        osc.stop(now + item.time + duration);
        
        activeOscillatorsRef.current.push(osc);
        
        setTimeout(() => {
          if (ctx.state === "closed") return;
          setVisualizerBars(prev => prev.map(() => Math.floor(20 + Math.random() * 80)));
        }, item.time * 1000);
      });
      
      setTimeout(() => {
        stopSynth();
      }, 3300);
      
    } catch (err) {
      console.error("Audio Context failed:", err);
      setIsPlayingSynth(false);
    }
  };

  useEffect(() => {
    return () => {
      activeOscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch(e){}
      });
    };
  }, []);

  const [verificationStep, setVerificationStep] = useState<"none" | "scanning" | "completed">("none");
  const [scanProgress, setScanProgress] = useState<number>(0);

  // Supabase Live Connection Config
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem("omni_sb_url") || "");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem("omni_sb_key") || "");
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(() => localStorage.getItem("omni_sb_connected") === "true");

  // PayPal Sandbox configuration states
  const [paypalModalOpen, setPaypalModalOpen] = useState(false);
  const [paypalCreatorId, setPaypalCreatorId] = useState("");
  const [paypalAmount, setPaypalAmount] = useState(9.99);
  const [isPaypalTip, setIsPaypalTip] = useState(false);
  const [paypalSubscriptionStep, setPaypalSubscriptionStep] = useState<"none" | "login" | "loading" | "approved">("none");
  const [paypalEmail, setPaypalEmail] = useState("sandbox-buyer@omnisphere.app");
  const [paypalPassword, setPaypalPassword] = useState("12345678");
  const [paypalClientId, setPaypalClientId] = useState(() => localStorage.getItem("omni_pp_client_id") || "AY0l_0kyQz8hIefxBnrlYDbzn_2tq8pKloNKJKyGi7NBMIWv-zQqUASsNuCqtQsMbaSH8HQbsiOA1oQn");
  const [paypalSecret, setPaypalSecret] = useState(() => localStorage.getItem("omni_pp_secret") || "EEXjH60kSMLiqhgfSLV4_K2Gku3FMmZ8hdWi5B4Zc3aKrGbt0SeGQrvPcATwr6xNn5Z2QJj8-_96Vj7p");
  const [paypalPlanId, setPaypalPlanId] = useState(() => localStorage.getItem("omni_pp_plan_id") || "P-78X90412B789");
  const [paypalLoadingText, setPaypalLoadingText] = useState("");

  // Agent Oracle States
  const [agentMessages, setAgentMessages] = useState<{sender: "user" | "oracle", text: string, time: string}[]>(() => {
    const saved = localStorage.getItem("omni_agent_messages");
    return saved ? JSON.parse(saved) : [
      {
        sender: "oracle",
        text: "System initialized. Welcome to Agent Oracle v1.1. Enter commands below to audit telemetry data, strip post metadata, optimize creator subscription copy, or chat securely.",
        time: new Date().toLocaleTimeString()
      }
    ];
  });
  const [agentInput, setAgentInput] = useState("");
  const [isAgentGenerating, setIsAgentGenerating] = useState(false);
  const [isScanningTelemetry, setIsScanningTelemetry] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [scanQualityScore, setScanQualityScore] = useState<number | null>(null);
  
  const [optRawText, setOptRawText] = useState("");
  const [optResult, setOptResult] = useState("");
  const [optNiche, setOptNiche] = useState("Model");
  
  const [advNiche, setAdvNiche] = useState("Model");
  const [advPriceResult, setAdvPriceResult] = useState<{suggested: number, min: number, max: number, rationale: string} | null>(null);

  // Database State (Persisted in localStorage for simulation)
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem("omni_profiles");
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem("omni_posts");
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("omni_messages");
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("omni_transactions");
    return saved ? JSON.parse(saved) : [
      {
        id: "tx-init",
        sender_id: null,
        receiver_id: "currentUser",
        amount: 150.00,
        tx_type: "deposit",
        description: "Initial wallet seed",
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ];
  });

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(() => {
    const saved = localStorage.getItem("omni_waitlist");
    return saved ? JSON.parse(saved) : [
      { id: "w-1", email: "alice@domain.com", handle: "alice_cyber", category: "Model", created_at: "2026-06-15T11:00:00Z" },
      { id: "w-2", email: "bob@hacker.io", handle: "dark_net_rebel", category: "Journalist", created_at: "2026-06-15T10:45:00Z" }
    ];
  });

  const [subscriptions, setSubscriptions] = useState<string[]>(() => {
    // List of creator IDs subscribed to
    const saved = localStorage.getItem("omni_subs");
    return saved ? JSON.parse(saved) : [];
  });

  // UI States
  const [activeChatUser, setActiveChatUser] = useState<string>("a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [newPostLocked, setNewPostLocked] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [tipCreatorId, setTipCreatorId] = useState("");
  const [tipAmount, setTipAmount] = useState("10");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistHandle, setWaitlistHandle] = useState("");
  const [waitlistCategory, setWaitlistCategory] = useState("Model");
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [depositAmount, setDepositAmount] = useState("100");
  const [withdrawAmount, setWithdrawAmount] = useState("50");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("omni_profiles", JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem("omni_posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("omni_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("omni_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("omni_waitlist", JSON.stringify(waitlist));
  }, [waitlist]);

  useEffect(() => {
    localStorage.setItem("omni_subs", JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem("omni_verified", String(isAgeVerified));
  }, [isAgeVerified]);

  useEffect(() => {
    localStorage.setItem("omni_agent_messages", JSON.stringify(agentMessages));
  }, [agentMessages]);

  // Sync Supabase URL/Key to localStorage
  useEffect(() => {
    localStorage.setItem("omni_sb_url", supabaseUrl);
    localStorage.setItem("omni_sb_key", supabaseAnonKey);
    localStorage.setItem("omni_sb_connected", String(isSupabaseConnected));
    if (isSupabaseConnected && supabaseUrl && supabaseAnonKey) {
      initSupabase(supabaseUrl, supabaseAnonKey);
    }
  }, [supabaseUrl, supabaseAnonKey, isSupabaseConnected]);

  // Sync PayPal Client/Plan/Secret settings
  useEffect(() => {
    localStorage.setItem("omni_pp_client_id", paypalClientId);
    localStorage.setItem("omni_pp_secret", paypalSecret);
    localStorage.setItem("omni_pp_plan_id", paypalPlanId);
  }, [paypalClientId, paypalSecret, paypalPlanId]);

  // Polling interval sync loop for Supabase
  useEffect(() => {
    if (!isSupabaseConnected || !supabaseUrl || !supabaseAnonKey) return;

    // Initialize custom client
    initSupabase(supabaseUrl, supabaseAnonKey);
    const client = getSupabase();
    if (!client) return;

    const syncData = async () => {
      try {
        // Sync Profiles
        const { data: dbProfiles } = await client.from("profiles").select("*");
        if (dbProfiles && dbProfiles.length > 0) {
          setProfiles(prev => {
            return dbProfiles.map((p: any) => {
              const local = prev.find(l => l.username === p.username);
              return {
                ...p,
                wallet_balance: local ? local.wallet_balance : Number(p.wallet_balance)
              };
            });
          });
        }

        // Sync Posts
        const { data: dbPosts } = await client.from("posts").select("*").order("created_at", { ascending: false });
        if (dbPosts && dbPosts.length > 0) {
          setPosts(dbPosts.map((p: any) => ({
            ...p,
            likes_count: Number(p.likes_count),
            is_locked: Boolean(p.is_locked)
          })));
        }

        // Sync Messages
        const { data: dbMessages } = await client.from("messages").select("*").order("created_at", { ascending: true });
        if (dbMessages && dbMessages.length > 0) {
          setMessages(dbMessages);
        }

        // Sync Transactions
        const { data: dbTransactions } = await client.from("transactions").select("*").order("created_at", { ascending: false });
        if (dbTransactions && dbTransactions.length > 0) {
          setTransactions(dbTransactions.map((t: any) => ({
            ...t,
            amount: Number(t.amount)
          })));
        }

        // Sync Waitlist
        const { data: dbWaitlist } = await client.from("waitlist").select("*").order("created_at", { ascending: false });
        if (dbWaitlist && dbWaitlist.length > 0) {
          setWaitlist(dbWaitlist);
        }
      } catch (err) {
        console.error("Supabase polling sync error:", err);
      }
    };

    syncData();
    const interval = setInterval(syncData, 4000);
    return () => clearInterval(interval);
  }, [isSupabaseConnected, supabaseUrl, supabaseAnonKey]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatUser, activeTab]);

  const currentUser = profiles.find(p => p.id === "currentUser") || profiles[3];

  // PayPal Smart Checkout Actions
  const handleOpenPayPalCheckout = (creatorId: string, amount?: number, isTip = false) => {
    setPaypalCreatorId(creatorId);
    setPaypalAmount(amount || 9.99);
    setIsPaypalTip(isTip);
    setPaypalSubscriptionStep("login");
    setPaypalModalOpen(true);
    setTipModalOpen(false); // Close standard modal
  };

  const handlePayPalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaypalSubscriptionStep("loading");
    setPaypalLoadingText("Connecting to PayPal Sandbox Gateway...");

    setTimeout(() => {
      setPaypalLoadingText("Authenticating sandbox profile and plan parameters...");
      
      setTimeout(() => {
        setPaypalLoadingText("Authorizing recurring payment agreement...");
        
        setTimeout(() => {
          setPaypalSubscriptionStep("approved");
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handlePayPalSuccessAction = async () => {
    const creator = profiles.find(p => p.id === paypalCreatorId);
    if (!creator) return;

    const subId = `I-SB${Math.floor(100000 + Math.random() * 900000)}`;

    if (isPaypalTip) {
      setProfiles(prev =>
        prev.map(p => (p.id === paypalCreatorId ? { ...p, wallet_balance: p.wallet_balance + paypalAmount } : p))
      );

      const newTx: Transaction = {
        id: `tx-pp-${Date.now()}`,
        sender_id: null,
        receiver_id: paypalCreatorId,
        amount: paypalAmount,
        tx_type: "tip",
        description: `PayPal Tip to @${creator.username} (Ref: ${subId})`,
        created_at: new Date().toISOString()
      };

      if (isSupabaseConnected) {
        const client = getSupabase();
        if (client) {
          await client.from("transactions").insert({
            receiver_id: paypalCreatorId,
            amount: paypalAmount,
            tx_type: "tip",
            description: `PayPal Tip to @${creator.username} (Ref: ${subId})`
          });
          await client.from("profiles").update({
            wallet_balance: creator.wallet_balance + paypalAmount
          }).eq("id", paypalCreatorId);
        }
      } else {
        setTransactions(prev => [newTx, ...prev]);
      }
      alert(`PayPal Tip of $${paypalAmount.toFixed(2)} credited to @${creator.username}!`);
    } else {
      setProfiles(prev =>
        prev.map(p => (p.id === paypalCreatorId ? { ...p, wallet_balance: p.wallet_balance + paypalAmount } : p))
      );
      setSubscriptions(prev => [...prev, paypalCreatorId]);

      const newTx: Transaction = {
        id: `tx-pp-${Date.now()}`,
        sender_id: null,
        receiver_id: paypalCreatorId,
        amount: paypalAmount,
        tx_type: "subscription",
        description: `PayPal Subscription to @${creator.username} (Sub ID: ${subId})`,
        created_at: new Date().toISOString()
      };

      if (isSupabaseConnected) {
        const client = getSupabase();
        if (client) {
          await client.from("transactions").insert({
            receiver_id: paypalCreatorId,
            amount: paypalAmount,
            tx_type: "subscription",
            description: `PayPal Subscription to @${creator.username} (Sub ID: ${subId})`
          });
          await client.from("profiles").update({
            wallet_balance: creator.wallet_balance + paypalAmount
          }).eq("id", paypalCreatorId);
          await client.from("subscriptions").insert({
            subscriber_id: "currentUser",
            creator_id: paypalCreatorId,
            status: "active"
          });
        }
      } else {
        setTransactions(prev => [newTx, ...prev]);
      }
      alert(`PayPal Subscription to @${creator.username} activated successfully!`);
    }

    setPaypalModalOpen(false);
    setPaypalSubscriptionStep("none");
  };

  // Agent Oracle Action Helpers
  const handleSendAgentMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInput.trim() || isAgentGenerating) return;

    const newMsg = {
      sender: "user" as const,
      text: agentInput,
      time: new Date().toLocaleTimeString()
    };

    setAgentMessages(prev => [...prev, newMsg]);
    setAgentInput("");
    setIsAgentGenerating(true);

    setTimeout(() => {
      const query = agentInput.toLowerCase();
      let replyText = "";

      if (query.includes("help") || query.includes("menu")) {
        replyText = "Agent Oracle dynamic systems are operational. I can assist you with:\n1. Telemetry Audit: Scan tracking scripts & headers.\n2. Social Content Optimizer: Upgrade your feed copy to fit premium aesthetics.\n3. Creator Financial Advisor: Recommend standard and custom subscription pricing tiers.\n\nSimply run the dashboards below or chat about encryption schemas.";
      } else if (query.includes("encryption") || query.includes("privacy") || query.includes("telemetry") || query.includes("censor")) {
        replyText = "Omnisphere R18 runs under strict database isolation. Standard social platforms log your IP, device identifiers, and sale histories. We employ local storage mapping & RLS rules in our Postgres schemas to secure user communication channels.";
      } else if (query.includes("wallet") || query.includes("money") || query.includes("cash") || query.includes("fee")) {
        replyText = "Creators retain 95% of direct cash flows from tips and subscriptions. The remaining 5% processing fee maintains zero-telemetry hosting nodes. View details in the Wallet ledger.";
      } else if (query.includes("hello") || query.includes("hi ") || query.includes("hey")) {
        replyText = "Greetings. Connection handshake secured. Let me know if you would like me to optimize a feed caption, calculate pricing metrics, or run a diagnostic telemetry sweep.";
      } else {
        replyText = `Audit request logged. Processing: "${agentInput}". Omnisphere strips telemetry files on image uploads. Let me know if you'd like to perform a live scan or adjust creator subscription prices.`;
      }

      const oracleMsg = {
        sender: "oracle" as const,
        text: replyText,
        time: new Date().toLocaleTimeString()
      };
      setAgentMessages(prev => [...prev, oracleMsg]);
      setIsAgentGenerating(false);
    }, 1200);
  };

  const handleRunTelemetryScan = () => {
    if (isScanningTelemetry) return;
    setIsScanningTelemetry(true);
    setTelemetryLogs([]);
    setScanQualityScore(null);

    const logSteps = [
      "[Handshake] Establishing local security loop...",
      "[Device Check] Scanning user-agent headers & browser fingerprinters...",
      "[Tracker Audit] Analyzing cookie storage (0 tracking cookies found)...",
      "[EXIF Scrub] Auditing image upload media metadata stripping...",
      "[Diagnostic Finish] Scan complete. Telemetry footprint: 100% clean."
    ];

    logSteps.forEach((step, index) => {
      setTimeout(() => {
        setTelemetryLogs(prev => [...prev, step]);
        if (index === logSteps.length - 1) {
          setScanQualityScore(100);
          setIsScanningTelemetry(false);
        }
      }, (index + 1) * 800);
    });
  };

  const handleOptimizeContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optRawText.trim()) return;

    let result = "";
    if (optNiche === "Model") {
      result = `⚡ EXCLUSIVE CONTENT | Uncensored preview from my latest industrial warehouse shoot. No tracking cookies, no shadowbans. Unlock the full 8K album in my subscription feed. 🖤`;
    } else if (optNiche === "Artist") {
      result = `🎨 WORKFLOW DUMP | Just completed the lighting pass on my abstract neon art. Download the raw Blender (.blend) file and shaders. Unlocked for members only.`;
    } else if (optNiche === "Journalist") {
      result = `📰 INTEL DOSSIER | Exposé on telemetry brokerage databases. No tracking scripts, no paywalls. Sub to support independent censor-free investigations.`;
    } else if (optNiche === "Musician") {
      result = `🎹 SYNTH LOOPS | Late-night hardware synth haptics and loops. Download high-quality raw WAV files in my subscription archive. 🎧`;
    } else {
      result = `✨ OMNISPHERE CORE | Unlocked content. Strip metadata, enjoy censor-free distribution. Supported directly by subscription syndicate.`;
    }

    setOptResult(result);
  };

  const handleCalculatePricing = (e: React.FormEvent) => {
    e.preventDefault();
    let suggested = 9.99;
    let min = 4.99;
    let max = 19.99;
    let rationale = "";

    if (advNiche === "Model") {
      suggested = 9.99;
      min = 5.00;
      max = 25.00;
      rationale = "High visual content drives direct impulsive subscription renewals. Keep pricing moderate ($9.99) to build a wide creator syndicate base.";
    } else if (advNiche === "Artist") {
      suggested = 14.99;
      min = 9.99;
      max = 30.00;
      rationale = "High-value asset downloads (Blender files, high-res assets) justify premium pricing tiers ($14.99+). Your subscriber count may be lower, but ARPU will be elevated.";
    } else if (advNiche === "Journalist") {
      suggested = 5.00;
      min = 2.99;
      max = 10.00;
      rationale = "Information dumps appeal to broader groups. Low, democratic pricing ($5.00) maximizes audience size and circulation velocity.";
    } else if (advNiche === "Musician") {
      suggested = 7.99;
      min = 4.99;
      max = 15.00;
      rationale = "Audio loops and haptic files require consistent releases. Moderate pricing ($7.99) matches values of loop libraries.";
    }

    setAdvPriceResult({ suggested, min, max, rationale });
  };

  // Action Helpers
  const handleUpdateWallet = (amount: number) => {
    setProfiles(prev =>
      prev.map(p => (p.id === "currentUser" ? { ...p, wallet_balance: p.wallet_balance + amount } : p))
    );
  };

  const handleSubscribe = (creatorId: string) => {
    const creator = profiles.find(p => p.id === creatorId);
    if (!creator) return;

    if (subscriptions.includes(creatorId)) return;

    if (currentUser.wallet_balance < creator.subscription_price) {
      alert("Insufficient wallet balance. Please deposit funds!");
      return;
    }

    // Deduct from current user, add to creator
    setProfiles(prev =>
      prev.map(p => {
        if (p.id === "currentUser") {
          return { ...p, wallet_balance: p.wallet_balance - creator.subscription_price };
        }
        if (p.id === creatorId) {
          return { ...p, wallet_balance: p.wallet_balance + creator.subscription_price };
        }
        return p;
      })
    );

    // Add subscription record
    setSubscriptions(prev => [...prev, creatorId]);

    // Create transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      sender_id: "currentUser",
      receiver_id: creatorId,
      amount: creator.subscription_price,
      tx_type: "subscription",
      description: `Monthly subscription to @${creator.username}`,
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleSendTip = () => {
    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (currentUser.wallet_balance < amount) {
      alert("Insufficient wallet balance!");
      return;
    }

    const creator = profiles.find(p => p.id === tipCreatorId);
    if (!creator) return;

    // Adjust balances
    setProfiles(prev =>
      prev.map(p => {
        if (p.id === "currentUser") {
          return { ...p, wallet_balance: p.wallet_balance - amount };
        }
        if (p.id === tipCreatorId) {
          return { ...p, wallet_balance: p.wallet_balance + amount };
        }
        return p;
      })
    );

    // Create transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      sender_id: "currentUser",
      receiver_id: tipCreatorId,
      amount,
      tx_type: "tip",
      description: `Tip to @${creator.username}`,
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);

    setTipModalOpen(false);
    alert(`Successfully sent a $${amount.toFixed(2)} tip to @${creator.username}!`);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      user_id: "currentUser",
      content: newPostContent,
      media_url: newPostImage.trim() || undefined,
      is_locked: newPostLocked,
      likes_count: 0,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConnected) {
      const client = getSupabase();
      if (client) {
        await client.from("posts").insert({
          user_id: "currentUser",
          content: newPostContent,
          media_url: newPostImage.trim() || null,
          is_locked: newPostLocked,
          likes_count: 0
        });
      }
    } else {
      setPosts(prev => [newPost, ...prev]);
    }

    setNewPostContent("");
    setNewPostImage("");
    setNewPostLocked(false);
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const liked = !post.liked_by_user;
          return {
            ...post,
            likes_count: liked ? post.likes_count + 1 : post.likes_count - 1,
            liked_by_user: liked
          };
        }
        return post;
      })
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender_id: "currentUser",
      receiver_id: activeChatUser,
      content: chatInput,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConnected) {
      const client = getSupabase();
      if (client) {
        await client.from("messages").insert({
          sender_id: "currentUser",
          receiver_id: activeChatUser,
          content: chatInput
        });
      }
    } else {
      setMessages(prev => [...prev, newMsg]);
    }
    setChatInput("");

    setTimeout(async () => {
      const creator = profiles.find(p => p.id === activeChatUser);
      if (!creator) return;

      let replyText = "";
      const textLower = chatInput.toLowerCase();

      if (creator.username === "cyber_vixen") {
        if (textLower.includes("synth") || textLower.includes("music") || textLower.includes("song") || textLower.includes("loop") || textLower.includes("melody")) {
          replyText = "Awesome! That C3 arpeggiator haptic loop is actually part of my upcoming track 'Midnight Static'. Check out the teaser player in the feed, you can play it live!";
        } else if (textLower.includes("sub") || textLower.includes("price") || textLower.includes("pricing") || textLower.includes("unlock")) {
          replyText = "Thanks for the support! Subscribing to my channel unlocks the full 8K master album downloads and all raw synth stems.";
        } else if (textLower.includes("hello") || textLower.includes("hi ") || textLower.includes("hey")) {
          replyText = "Hey! Glad you're here. Let me know what you think of my studio logs. I'm cooking up some new arps tonight.";
        } else {
          replyText = "A lot of other sites shadowban my posts, so I'm glad we can chat freely here without filters. Let me know what you think about my synth loops!";
        }
      } else if (creator.username === "pixel_ghost") {
        if (textLower.includes("commission") || textLower.includes("3d") || textLower.includes("art") || textLower.includes("render") || textLower.includes("mesh")) {
          replyText = "Yes! I am open for custom 3D commissions. Standard rates start at 100 tokens ($100) per mesh. Let me know your concept!";
        } else if (textLower.includes("hello") || textLower.includes("hi ") || textLower.includes("hey")) {
          replyText = "Stay virtual! Pushing my latest Blender shader preview to the feed shortly. Sub to grab the raw source files.";
        } else {
          replyText = "Yes, absolutely. Uncensored distribution makes all the difference for digital artists. Let me know what custom 3D model you need for commission!";
        }
      } else if (creator.username === "shadow_scribe") {
        if (textLower.includes("document") || textLower.includes("leak") || textLower.includes("file") || textLower.includes("pdf")) {
          replyText = "The complete PDF dossier is fully unlocked for my subscribers. It exposes the metadata brokerage transaction chains in detail.";
        } else {
          replyText = "Uncensored distribution is vital. Ad-free, tracking-free journalism is the only way to expose telemetry brokers. Next document dump is coming shortly.";
        }
      } else {
        replyText = "Zero-telemetry handshake active. We are completely off the grid here. Let me know what you think!";
      }

      const replyMsg: Message = {
        id: `msg-reply-${Date.now()}`,
        sender_id: activeChatUser,
        receiver_id: "currentUser",
        content: replyText,
        created_at: new Date().toISOString()
      };

      if (isSupabaseConnected) {
        const client = getSupabase();
        if (client) {
          await client.from("messages").insert({
            sender_id: activeChatUser,
            receiver_id: "currentUser",
            content: replyText
          });
        }
      } else {
        setMessages(prev => [...prev, replyMsg]);
      }
    }, 1500);
  };

  const handleAddToWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.trim() || !waitlistHandle.trim()) return;

    const newEntry: WaitlistEntry = {
      id: `w-${Date.now()}`,
      email: waitlistEmail,
      handle: waitlistHandle.replace("@", ""),
      category: waitlistCategory,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConnected) {
      const client = getSupabase();
      if (client) {
        await client.from("waitlist").insert({
          email: waitlistEmail,
          handle: waitlistHandle.replace("@", ""),
          category: waitlistCategory
        });
      }
    } else {
      setWaitlist(prev => [newEntry, ...prev]);
    }

    setWaitlistEmail("");
    setWaitlistHandle("");
    setWaitlistSuccess(true);

    setTimeout(() => setWaitlistSuccess(false), 5000);
  };

  const startAgeVerificationScan = () => {
    setVerificationStep("scanning");
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAgeVerified(true);
            setVerificationStep("completed");
          }, 600);
          return 100;
        }
        return p + 4;
      });
    }, 80);
  };

  const handleResetApp = () => {
    if (confirm("Reset local database state to initial seed data?")) {
      localStorage.clear();
      setProfiles(INITIAL_PROFILES);
      setPosts(INITIAL_POSTS);
      setMessages(INITIAL_MESSAGES);
      setSubscriptions([]);
      setTransactions([
        {
          id: "tx-init",
          sender_id: null,
          receiver_id: "currentUser",
          amount: 150.00,
          tx_type: "deposit",
          description: "Initial wallet seed",
          created_at: new Date().toISOString()
        }
      ]);
      setWaitlist([
        { id: "w-1", email: "alice@domain.com", handle: "alice_cyber", category: "Model", created_at: "2026-06-15T11:00:00Z" },
        { id: "w-2", email: "bob@hacker.io", handle: "dark_net_rebel", category: "Journalist", created_at: "2026-06-15T10:45:00Z" }
      ]);
      setIsAgeVerified(false);
      setVerificationStep("none");
      alert("Application storage reset completed.");
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col antialiased">
      {/* 18+ Warning / Verification Portal Overlay */}
      {!isAgeVerified && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel p-8 rounded-2xl border-brand-primary/20 shadow-[0_0_50px_rgba(255,0,127,0.15)] flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/40 flex items-center justify-center text-brand-primary mb-6 animate-pulse-slow">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h1 className="text-3xl font-cyber font-bold tracking-tight text-white mb-2">
              OMNISPHERE <span className="text-neon-pink">R18</span>
            </h1>
            <p className="text-brand-accent text-sm font-semibold uppercase tracking-wider mb-6">
              Next-Gen Uncensored Social Engine
            </p>

            {verificationStep === "none" && (
              <>
                <p className="text-dark-muted text-sm leading-relaxed mb-8">
                  This platform contains mature content (R18+) including unfiltered journalism, artistic nudity, independent music, and private encryption keys. You must verify your age biometric status to proceed.
                </p>
                <div className="w-full flex flex-col gap-3">
                  <button
                    onClick={startAgeVerificationScan}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold tracking-wide hover:shadow-[0_0_20px_var(--color-glow-pink)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    Verify Age with AI Face Scanner
                  </button>
                  <button
                    onClick={() => {
                      setIsAgeVerified(true);
                      localStorage.setItem("omni_verified", "true");
                    }}
                    className="w-full py-3 rounded-xl bg-dark-card border border-dark-border text-dark-muted hover:text-white hover:bg-dark-hover transition-colors text-sm cursor-pointer"
                  >
                    Bypass / Manual 18+ Declaration
                  </button>
                </div>
              </>
            )}

            {verificationStep === "scanning" && (
              <div className="w-full flex flex-col items-center">
                <div className="relative w-48 h-48 rounded-full border-4 border-dashed border-brand-accent/50 flex items-center justify-center overflow-hidden mb-6 bg-zinc-900/60 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                  <BiometricScannerCanvas />
                  
                  {/* Scanline Overlay */}
                  <div className="absolute left-0 right-0 h-1 bg-brand-accent/80 shadow-[0_0_8px_var(--color-glow-cyan)] animate-scanline"></div>
                </div>

                <p className="text-white font-medium mb-2">Biometric Verification In Progress...</p>
                <p className="text-brand-accent font-mono text-sm mb-4">{scanProgress}% Scanned</p>
                
                {/* Progress bar */}
                <div className="w-full bg-dark-border h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-accent h-full transition-all duration-100"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main App Layout */}
      <header className="sticky top-0 z-40 border-b border-dark-border bg-dark-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-cyber font-black tracking-tighter text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-sm shadow-[0_0_15px_var(--color-glow-pink)]">
                Ω
              </span>
              OMNISPHERE <span className="text-neon-pink">R18</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero-Telemetry PWA v6.2
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Wallet Stats */}
            <div
              onClick={() => setActiveTab("wallet")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border hover:border-brand-primary/30 transition-all cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-brand-accent" />
              <span className="font-mono text-sm font-semibold text-white">
                ${currentUser.wallet_balance.toFixed(2)}
              </span>
            </div>

            {/* Developer SQL Panel Button */}
            <button
              onClick={() => setShowDevPanel(!showDevPanel)}
              className="p-2 rounded-xl bg-dark-card border border-dark-border hover:text-brand-accent hover:border-brand-accent/30 transition-colors text-dark-muted cursor-pointer"
              title="Database Dev Console"
            >
              <Database className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* SQL Dev Panel Drawer */}
      {showDevPanel && (
        <div className="bg-zinc-950 border-b border-brand-accent/20 p-6 font-mono text-xs text-zinc-300">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <h3 className="text-brand-accent font-bold flex items-center gap-2 text-sm">
                <Database className="w-4 h-4" /> SUPABASE LIVE CONFIG
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-dark-muted">SUPABASE PROJECT URL</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={e => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-ref.supabase.co"
                    className="w-full px-3 py-1.5 rounded bg-dark-bg border border-dark-border text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-dark-muted">SUPABASE ANON KEY</label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={e => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-1.5 rounded bg-dark-bg border border-dark-border text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (!supabaseUrl || !supabaseAnonKey) {
                      alert("Please fill in both Supabase URL and Anon Key!");
                      return;
                    }
                    setIsSupabaseConnected(true);
                    alert("Supabase live connections initialized!");
                  }}
                  className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                    isSupabaseConnected 
                      ? "bg-brand-matrix/20 border border-brand-matrix text-brand-matrix" 
                      : "bg-white text-black hover:bg-zinc-200"
                  }`}
                >
                  {isSupabaseConnected ? "CONNECTED" : "CONNECT DATABASE"}
                </button>

                {isSupabaseConnected && (
                  <button
                    onClick={() => {
                      setIsSupabaseConnected(false);
                      alert("Disconnected from live Supabase DB.");
                    }}
                    className="px-3 py-1.5 bg-red-950/40 border border-red-500/30 text-red-400 rounded hover:bg-red-900/40 transition-colors cursor-pointer"
                  >
                    DISCONNECT
                  </button>
                )}

                <button
                  onClick={handleResetApp}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:text-white rounded transition-colors cursor-pointer"
                >
                  Reset Local DB
                </button>
                <button
                  onClick={() => setIsAgeVerified(false)}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:text-white rounded transition-colors cursor-pointer"
                >
                  Lock Age-Gating
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <h3 className="text-[#ffc439] font-bold flex items-center gap-2 text-sm">
                <span className="italic">PayPal</span> SANDBOX CONFIG
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] text-dark-muted">PAYPAL CLIENT ID</label>
                  <input
                    type="text"
                    value={paypalClientId}
                    onChange={e => setPaypalClientId(e.target.value)}
                    placeholder="sb-client-id"
                    className="w-full px-3 py-1.5 rounded bg-dark-bg border border-dark-border text-white text-xs focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-dark-muted">PAYPAL SECRET</label>
                  <input
                    type="password"
                    value={paypalSecret}
                    onChange={e => setPaypalSecret(e.target.value)}
                    placeholder="sb-secret-key"
                    className="w-full px-3 py-1.5 rounded bg-dark-bg border border-dark-border text-white text-xs focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-dark-muted">PAYPAL PLAN ID (RECURRING)</label>
                  <input
                    type="text"
                    value={paypalPlanId}
                    onChange={e => setPaypalPlanId(e.target.value)}
                    placeholder="P-PLANID"
                    className="w-full px-3 py-1.5 rounded bg-dark-bg border border-dark-border text-white text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>
              
              <p className="text-[10px] text-zinc-500 leading-relaxed pt-1 border-t border-dark-border/40">
                Sandbox credentials configured. Smart buttons authorize recurring checkout agreements via standard client token bindings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Core Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 lg:w-60 shrink-0">
          <button
            onClick={() => setActiveTab("feed")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === "feed"
                ? "bg-gradient-to-r from-brand-primary/20 to-brand-secondary/10 text-white border border-brand-primary/30 shadow-[0_0_15px_rgba(255,0,127,0.05)]"
                : "text-dark-muted hover:text-white hover:bg-dark-card border border-transparent"
            }`}
          >
            <Sparkles className="w-5 h-5 text-brand-primary" />
            Uncensored Feed
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === "messages"
                ? "bg-gradient-to-r from-brand-primary/20 to-brand-secondary/10 text-white border border-brand-primary/30 shadow-[0_0_15px_rgba(255,0,127,0.05)]"
                : "text-dark-muted hover:text-white hover:bg-dark-card border border-transparent"
            }`}
          >
            <MessageSquare className="w-5 h-5 text-brand-secondary" />
            Direct Messages
          </button>

          <button
            onClick={() => setActiveTab("studio")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === "studio"
                ? "bg-gradient-to-r from-brand-primary/20 to-brand-secondary/10 text-white border border-brand-primary/30 shadow-[0_0_15px_rgba(255,0,127,0.05)]"
                : "text-dark-muted hover:text-white hover:bg-dark-card border border-transparent"
            }`}
          >
            <Award className="w-5 h-5 text-brand-accent" />
            Creator Studio
          </button>

          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === "wallet"
                ? "bg-gradient-to-r from-brand-primary/20 to-brand-secondary/10 text-white border border-brand-primary/30 shadow-[0_0_15px_rgba(255,0,127,0.05)]"
                : "text-dark-muted hover:text-white hover:bg-dark-card border border-transparent"
            }`}
          >
            <Wallet className="w-5 h-5 text-yellow-500" />
            Wallet & Billing
          </button>

          <button
            onClick={() => setActiveTab("waitlist")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === "waitlist"
                ? "bg-gradient-to-r from-brand-primary/20 to-brand-secondary/10 text-white border border-brand-primary/30 shadow-[0_0_15px_rgba(255,0,127,0.05)]"
                : "text-dark-muted hover:text-white hover:bg-dark-card border border-transparent"
            }`}
          >
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            Waitlist Portal
          </button>

          <button
            onClick={() => setActiveTab("agent")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === "agent"
                ? "bg-gradient-to-r from-brand-matrix/20 to-brand-matrix/10 text-white border border-brand-matrix/30 shadow-[0_0_15px_rgba(0,255,102,0.05)]"
                : "text-dark-muted hover:text-white hover:bg-dark-card border border-transparent"
            }`}
          >
            <UserCheck className="w-5 h-5 text-brand-matrix" />
            Agent Oracle
          </button>
        </nav>

        {/* Content Panels */}
        <div className="flex-1 min-w-0">
          
          {/* TAB 1: UNCENSORED FEED */}
          {activeTab === "feed" && (
            <div className="space-y-6">
              {/* Creator Status Prompt */}
              <div className="glass-panel-fuchsia p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-cyber font-bold text-white text-base">You keep 95% of your earnings</h3>
                    <p className="text-xs text-dark-muted mt-0.5">Ad-free. Zero-tracking. Monetize your passion without arbitrary bans.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("studio")}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold text-sm hover:shadow-[0_0_15px_rgba(255,0,127,0.3)] transition-all cursor-pointer whitespace-nowrap"
                >
                  Start Earning
                </button>
              </div>

              {/* Create Post Form */}
              <form onSubmit={handleCreatePost} className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4">
                <div className="flex gap-4">
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.display_name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-dark-border"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newPostContent}
                      onChange={e => setNewPostContent(e.target.value)}
                      placeholder="What is happening? Share uncensored files or thoughts..."
                      rows={3}
                      className="w-full bg-transparent border-0 resize-none outline-none text-white text-sm placeholder:text-zinc-600 focus:ring-0"
                    />
                  </div>
                </div>

                <div className="border-t border-dark-border/40 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {/* Image URL Input */}
                    <div className="relative flex-1 sm:flex-initial">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                        <ImageIcon className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="Attach image URL..."
                        value={newPostImage}
                        onChange={e => setNewPostImage(e.target.value)}
                        className="w-full sm:w-60 pl-9 pr-3 py-1.5 rounded-lg bg-dark-bg/60 border border-dark-border text-xs focus:outline-none focus:border-brand-accent text-white"
                      />
                    </div>

                    {/* Content Locking Checkbox */}
                    <label className="flex items-center gap-2 text-xs text-dark-muted cursor-pointer hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={newPostLocked}
                        onChange={e => setNewPostLocked(e.target.checked)}
                        className="rounded border-dark-border bg-dark-bg text-brand-primary focus:ring-brand-primary"
                      />
                      <Lock className="w-3.5 h-3.5 text-brand-primary" />
                      Lock for Subscribers
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Post Feed
                  </button>
                </div>
              </form>

              {/* Posts Feed */}
              <div className="space-y-6">
                {posts.map(post => {
                  const author = profiles.find(p => p.id === post.user_id) || currentUser;
                  const isSubbed = subscriptions.includes(post.user_id) || post.user_id === "currentUser";
                  const isContentLocked = post.is_locked && !isSubbed;

                  return (
                    <article key={post.id} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden transition-all duration-300">
                      
                      {/* Author Header */}
                      <div className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={author.avatar_url}
                            alt={author.display_name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-dark-border"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-white text-sm">{author.display_name}</h4>
                              {author.is_creator && (
                                <span className="px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-[10px] font-bold border border-brand-primary/20">
                                  CREATOR
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-dark-muted">@{author.username}</p>
                          </div>
                        </div>
                        
                        {post.is_locked && (
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            isSubbed ? "bg-brand-accent/10 text-brand-accent" : "bg-brand-primary/10 text-brand-primary"
                          }`}>
                            {isSubbed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            {isSubbed ? "Unlocked" : "Locked Content"}
                          </div>
                        )}
                      </div>

                      {/* Post Media / Content Locker */}
                      {isContentLocked ? (
                        <div className="relative h-72 bg-gradient-to-tr from-zinc-950 to-zinc-900 border-y border-dark-border flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                          {/* Blurred background image simulator */}
                          {post.media_url && (
                            <img
                              src={post.media_url}
                              alt="Blurred preview"
                              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-15"
                            />
                          )}
                          <div className="relative z-10 max-w-sm flex flex-col items-center">
                            <div className="w-14 h-14 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary mb-4 shadow-[0_0_20px_var(--color-glow-pink)]">
                              <LockKeyhole className="w-6 h-6" />
                            </div>
                            <h5 className="font-cyber font-bold text-white mb-2">Locked for @{author.username} Subscribers</h5>
                            <p className="text-xs text-dark-muted mb-6">
                              Unlock this media post and access complete archive by subscribing to their exclusive feed.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                              <button
                                onClick={() => handleSubscribe(post.user_id)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold hover:shadow-[0_0_15px_var(--color-glow-pink)] transition-all cursor-pointer whitespace-nowrap"
                              >
                                Subscribe with Wallet (${author.subscription_price.toFixed(2)})
                              </button>
                              <button
                                onClick={() => handleOpenPayPalCheckout(post.user_id, author.subscription_price, false)}
                                className="px-5 py-2.5 rounded-xl bg-[#ffc439] hover:bg-[#f2b522] text-[#111] text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap animate-float"
                              >
                                <span className="italic font-bold">PayPal</span> Subscribe
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="px-5 pb-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                            {post.content}
                          </div>
                          {post.media_url && (
                            <div className="border-y border-dark-border bg-black/40 overflow-hidden">
                              <img
                                src={post.media_url}
                                alt="Post attachment"
                                className="w-full max-h-[480px] object-cover hover:scale-[1.01] transition-transform duration-500"
                              />
                            </div>
                          )}

                          {post.id === "post-1" && (
                            <div className="mx-5 mb-4 p-4 rounded-xl bg-zinc-950 border border-brand-primary/20 flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={handlePlaySynth}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                      isPlayingSynth 
                                        ? "bg-brand-primary shadow-[0_0_12px_rgba(255,0,127,0.4)] animate-pulse" 
                                        : "bg-zinc-800 text-white hover:bg-brand-primary"
                                    }`}
                                  >
                                    {isPlayingSynth ? (
                                      <span className="text-xs font-sans">■</span>
                                    ) : (
                                      <span className="text-xs font-sans pl-0.5">▶</span>
                                    )}
                                  </button>
                                  <div>
                                    <span className="text-xs font-cyber font-bold text-white block">Teaser Jams: Midnight Static</span>
                                    <span className="text-[9px] text-brand-primary uppercase tracking-wider font-semibold">Synthesizer haptic loops</span>
                                  </div>
                                </div>
                                <span className="font-mono text-xs text-dark-muted">0:12</span>
                              </div>
                              
                              <div className="flex items-end gap-1 h-6 px-2">
                                {visualizerBars.map((val, idx) => (
                                  <div
                                    key={idx}
                                    className="flex-1 bg-gradient-to-t from-brand-primary via-brand-secondary to-brand-accent rounded-t transition-all duration-150"
                                    style={{ height: `${val}%` }}
                                  ></div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Post Actions Footer */}
                      <div className="px-5 py-4 bg-zinc-900/20 flex items-center justify-between border-t border-dark-border/40">
                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer ${
                              post.liked_by_user ? "text-brand-primary" : "text-dark-muted hover:text-white"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${post.liked_by_user ? "fill-brand-primary" : ""}`} />
                            {post.likes_count}
                          </button>
                          
                          {/* Messages redirection */}
                          <button
                            onClick={() => {
                              if (author.id !== "currentUser") {
                                setActiveChatUser(author.id);
                                setActiveTab("messages");
                              }
                            }}
                            className="flex items-center gap-2 text-xs font-semibold text-dark-muted hover:text-white transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" /> Message
                          </button>
                        </div>

                        {/* Tip Creator Action */}
                        {author.id !== "currentUser" && (
                          <button
                            onClick={() => {
                              setTipCreatorId(author.id);
                              setTipModalOpen(true);
                            }}
                            className="text-xs px-3 py-1.5 rounded-lg bg-dark-card border border-dark-border text-brand-accent hover:border-brand-accent/40 font-semibold transition-colors cursor-pointer"
                          >
                            Tip Creator
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DIRECT MESSAGES */}
          {activeTab === "messages" && (
            <div className="h-[650px] bg-dark-card border border-dark-border rounded-2xl overflow-hidden flex">
              
              {/* Chats Sidebar */}
              <div className="w-64 border-r border-dark-border flex flex-col bg-zinc-950/40">
                <div className="p-4 border-b border-dark-border">
                  <h3 className="font-bold text-white text-sm">Conversations</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {profiles
                    .filter(p => p.id !== "currentUser")
                    .map(creator => {
                      const isSelected = activeChatUser === creator.id;
                      const lastMsg = messages
                        .filter(m => (m.sender_id === creator.id && m.receiver_id === "currentUser") || (m.sender_id === "currentUser" && m.receiver_id === creator.id))
                        .pop();

                      return (
                        <button
                          key={creator.id}
                          onClick={() => setActiveChatUser(creator.id)}
                          className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors cursor-pointer text-left ${
                            isSelected ? "bg-dark-border/40 border border-dark-border" : "hover:bg-dark-card/60"
                          }`}
                        >
                          <img
                            src={creator.avatar_url}
                            alt={creator.display_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white text-xs truncate">{creator.display_name}</h4>
                            <p className="text-[10px] text-dark-muted truncate mt-0.5">
                              {lastMsg ? lastMsg.content : `Start chat with @${creator.username}`}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Chat View */}
              <div className="flex-1 flex flex-col bg-dark-bg/20">
                {(() => {
                  const creator = profiles.find(p => p.id === activeChatUser);
                  if (!creator) return null;

                  const filteredMessages = messages.filter(
                    m =>
                      (m.sender_id === creator.id && m.receiver_id === "currentUser") ||
                      (m.sender_id === "currentUser" && m.receiver_id === creator.id)
                  );

                  return (
                    <>
                      {/* Chat Header */}
                      <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between bg-zinc-950/20">
                        <div className="flex items-center gap-3">
                          <img
                            src={creator.avatar_url}
                            alt={creator.display_name}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-dark-border"
                          />
                          <div>
                            <h4 className="font-bold text-white text-sm">{creator.display_name}</h4>
                            <p className="text-xs text-brand-accent">@{creator.username}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setTipCreatorId(creator.id);
                            setTipModalOpen(true);
                          }}
                          className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors cursor-pointer"
                        >
                          <Coins className="w-3.5 h-3.5" /> Tip Creator
                        </button>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {filteredMessages.map(msg => {
                          const isMe = msg.sender_id === "currentUser";
                          return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-md rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                  isMe
                                    ? "bg-gradient-to-tr from-brand-primary to-brand-secondary text-white rounded-br-none"
                                    : "bg-dark-card border border-dark-border text-zinc-300 rounded-bl-none"
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef}></div>
                      </div>

                      {/* Input Footer */}
                      <form onSubmit={handleSendMessage} className="p-4 border-t border-dark-border bg-zinc-950/20 flex gap-3">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          placeholder={`Message @${creator.username}... (Simulated creator auto-replies)`}
                          className="flex-1 px-4 py-3 rounded-xl bg-dark-bg/60 border border-dark-border text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-accent"
                        />
                        <button
                          type="submit"
                          className="px-5 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors flex items-center justify-center cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 3: CREATOR STUDIO */}
          {activeTab === "studio" && (
            <div className="space-y-8">
              {/* Analytics Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-dark-card border border-dark-border p-6 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-dark-muted uppercase tracking-wider">Total Subscribers</span>
                    <span className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary"><Users className="w-4 h-4" /></span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-mono font-bold text-white">1,482</h3>
                    <span className="text-xs text-brand-accent font-semibold flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3" /> +12.4% this month</span>
                  </div>
                </div>

                <div className="bg-dark-card border border-dark-border p-6 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-dark-muted uppercase tracking-wider">Monthly Recurring Revenue</span>
                    <span className="p-2 rounded-lg bg-brand-secondary/10 text-brand-secondary"><DollarSign className="w-4 h-4" /></span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-mono font-bold text-white">$14,805.20</h3>
                    <span className="text-xs text-brand-accent font-semibold flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3" /> +8.1% this month</span>
                  </div>
                </div>

                <div className="bg-dark-card border border-dark-border p-6 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-dark-muted uppercase tracking-wider">Creator Balance</span>
                    <span className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500"><Coins className="w-4 h-4" /></span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-mono font-bold text-white">$4,760.00</h3>
                    <span className="text-xs text-dark-muted flex items-center gap-1 mt-1">Available for instant withdrawal</span>
                  </div>
                </div>
              </div>

              {/* Creator Pricing Controller */}
              <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="font-cyber font-bold text-white text-base">Subscription Price Settings</h3>
                  <p className="text-xs text-dark-muted mt-1">Customize the monthly subscription cost to unlock your exclusive feed content.</p>
                </div>

                <div className="flex items-center gap-4 max-w-sm">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue="9.99"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-dark-bg/60 border border-dark-border text-white font-mono text-sm focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <button
                    onClick={() => alert("Subscription settings saved successfully!")}
                    className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Update Price
                  </button>
                </div>
              </div>

              {/* Simulated Earnings Graph */}
              <div className="bg-dark-card border border-dark-border p-6 rounded-2xl">
                <h3 className="font-cyber font-bold text-white text-base mb-6">Weekly Earnings Breakdown</h3>
                <div className="h-48 flex items-end gap-3 pt-6 border-b border-dark-border/40">
                  {[450, 720, 980, 610, 1200, 1400, 1850].map((val, idx) => {
                    const percent = (val / 2000) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <span className="text-[10px] font-mono text-brand-accent">${val}</span>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-brand-primary/80 to-brand-secondary transition-all duration-1000"
                          style={{ height: `${percent}%` }}
                        ></div>
                        <span className="text-[10px] text-dark-muted mt-1">Day {idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WALLET & BILLING */}
          {activeTab === "wallet" && (
            <div className="space-y-8">
              {/* Gradient Balance Card */}
              <div className="bg-gradient-to-tr from-brand-primary to-brand-secondary p-8 rounded-3xl text-white relative overflow-hidden shadow-[0_0_30px_var(--color-glow-pink)]">
                {/* Abstract Glowing Orb */}
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl translate-x-10 translate-y-10"></div>
                
                <div className="relative z-10 space-y-6">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Total Available Balance</span>
                    <h2 className="text-4xl font-cyber font-black tracking-tight mt-1">
                      ${currentUser.wallet_balance.toFixed(2)}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-white/10 text-white border border-white/20 text-[10px] font-bold tracking-wider">
                      DECEN-DEPOSIT ENABLED
                    </span>
                    <span className="text-xs opacity-80">95% Creator payout processing</span>
                  </div>
                </div>
              </div>

              {/* Deposit/Withdraw simulators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4">
                  <h4 className="font-cyber font-bold text-white text-sm">Deposit Simulated Tokens</h4>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      placeholder="Amount to deposit..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-dark-bg/60 border border-dark-border text-white text-sm font-mono"
                    />
                    <button
                      onClick={() => {
                        const amt = parseFloat(depositAmount);
                        if (!isNaN(amt) && amt > 0) {
                          handleUpdateWallet(amt);
                          const newTx: Transaction = {
                            id: `tx-dep-${Date.now()}`,
                            sender_id: null,
                            receiver_id: "currentUser",
                            amount: amt,
                            tx_type: "deposit",
                            description: "Token deposit (Simulated)",
                            created_at: new Date().toISOString()
                          };
                          setTransactions(prev => [newTx, ...prev]);
                          alert(`Deposited $${amt.toFixed(2)} tokens!`);
                        }
                      }}
                      className="px-5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      Deposit
                    </button>
                  </div>
                </div>

                <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-4">
                  <h4 className="font-cyber font-bold text-white text-sm">Withdraw Simulated Cash</h4>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                      placeholder="Amount to withdraw..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-dark-bg/60 border border-dark-border text-white text-sm font-mono"
                    />
                    <button
                      onClick={() => {
                        const amt = parseFloat(withdrawAmount);
                        if (!isNaN(amt) && amt > 0) {
                          if (currentUser.wallet_balance < amt) {
                            alert("Insufficient funds!");
                            return;
                          }
                          handleUpdateWallet(-amt);
                          const newTx: Transaction = {
                            id: `tx-wth-${Date.now()}`,
                            sender_id: "currentUser",
                            receiver_id: null,
                            amount: amt,
                            tx_type: "withdrawal",
                            description: "Token withdrawal (Simulated)",
                            created_at: new Date().toISOString()
                          };
                          setTransactions(prev => [newTx, ...prev]);
                          alert(`Withdrew $${amt.toFixed(2)} tokens!`);
                        }
                      }}
                      className="px-5 rounded-xl bg-dark-card border border-dark-border text-white font-semibold text-sm hover:bg-dark-hover transition-colors cursor-pointer"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-dark-border bg-zinc-950/20">
                  <h4 className="font-cyber font-bold text-white text-sm">Transaction Ledger</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs text-zinc-400">
                    <thead>
                      <tr className="border-b border-dark-border/40 text-dark-muted font-semibold uppercase tracking-wider bg-zinc-950/10">
                        <th className="p-4">Transaction Details</th>
                        <th className="p-4">Type</th>
                        <th className="p-4 text-right">Amount</th>
                        <th className="p-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/40">
                      {transactions.map(tx => {
                        const isIncome = tx.receiver_id === "currentUser" && tx.tx_type !== "withdrawal";
                        return (
                          <tr key={tx.id} className="hover:bg-dark-card/40 transition-colors">
                            <td className="p-4 font-medium text-white">{tx.description}</td>
                            <td className="p-4 capitalize">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tx.tx_type === "tip" ? "bg-brand-primary/10 text-brand-primary" :
                                tx.tx_type === "subscription" ? "bg-brand-accent/10 text-brand-accent" :
                                tx.tx_type === "deposit" ? "bg-green-500/10 text-green-400" :
                                "bg-zinc-500/10 text-zinc-400"
                              }`}>
                                {tx.tx_type}
                              </span>
                            </td>
                            <td className={`p-4 text-right font-mono font-bold ${isIncome ? "text-green-400" : "text-brand-primary"}`}>
                              {isIncome ? "+" : "-"}${tx.amount.toFixed(2)}
                            </td>
                            <td className="p-4 text-dark-muted font-mono">{new Date(tx.created_at).toLocaleTimeString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WAITLIST PORTAL */}
          {activeTab === "waitlist" && (
            <div className="space-y-8">
              {/* Waitlist Landing */}
              <div className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-dark-border p-8 md:p-12 rounded-3xl overflow-hidden text-center space-y-6">
                
                {/* Glowing decorative lights */}
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-brand-accent/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                  <span className="px-3 py-1 rounded-full bg-brand-primary/15 text-brand-primary text-xs font-bold border border-brand-primary/20 uppercase tracking-widest animate-pulse">
                    Exclusive Creator Signup
                  </span>
                  
                  <h2 className="text-3xl md:text-4xl font-cyber font-black tracking-tight text-white leading-tight">
                    Secure Your Handle Before the Official Engine Launch
                  </h2>
                  
                  <p className="text-sm text-dark-muted leading-relaxed">
                    Omnisphere is an ad-free, zero-telemetry mature social engine where independent creators keep 95% of subscription earnings, protected from shadowbans or metadata harvesting.
                  </p>
                </div>

                {/* Form Reservation */}
                <div className="relative z-10 max-w-md mx-auto bg-dark-card/60 backdrop-blur-md border border-dark-border p-6 rounded-2xl">
                  {waitlistSuccess ? (
                    <div className="py-8 flex flex-col items-center gap-3 text-green-400">
                      <CheckCircle className="w-12 h-12" />
                      <h4 className="font-bold text-white">Handle Reserved Successfully!</h4>
                      <p className="text-xs text-dark-muted">We have logged your reservation details in our waitlist database.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleAddToWaitlist} className="space-y-4 text-left">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">Reserved Creator Handle</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold">@</span>
                          <input
                            type="text"
                            required
                            placeholder="username"
                            value={waitlistHandle}
                            onChange={e => setWaitlistHandle(e.target.value)}
                            className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-dark-bg/60 border border-dark-border text-white text-sm focus:outline-none focus:border-brand-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">Secure Contact Email</label>
                        <input
                          type="email"
                          required
                          placeholder="you@domain.com"
                          value={waitlistEmail}
                          onChange={e => setWaitlistEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-dark-bg/60 border border-dark-border text-white text-sm focus:outline-none focus:border-brand-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">Creator Specialization Niche</label>
                        <select
                          value={waitlistCategory}
                          onChange={e => setWaitlistCategory(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-dark-bg/60 border border-dark-border text-white text-sm focus:outline-none focus:border-brand-primary"
                        >
                          <option value="Model">Alternative Fashion / Model</option>
                          <option value="Artist">Digital Artist / Animator</option>
                          <option value="Journalist">Independent Journalist</option>
                          <option value="Musician">Independent Musician / Synthesizer</option>
                          <option value="Other">Other Creative Specialization</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold tracking-wide hover:shadow-[0_0_15px_var(--color-glow-pink)] transition-all cursor-pointer"
                      >
                        Reserve Creator Spot
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Waitlist Database Viewer */}
              <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-dark-border bg-zinc-950/20">
                  <h4 className="font-cyber font-bold text-white text-sm">Active Waitlist Database Entries ({waitlist.length})</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs text-zinc-400">
                    <thead>
                      <tr className="border-b border-dark-border/40 text-dark-muted font-semibold uppercase tracking-wider bg-zinc-950/10">
                        <th className="p-4">Reserved Handle</th>
                        <th className="p-4">Niche Specialization</th>
                        <th className="p-4">Verification Email</th>
                        <th className="p-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/40">
                      {waitlist.map(entry => (
                        <tr key={entry.id} className="hover:bg-dark-card/40 transition-colors">
                          <td className="p-4 font-medium text-white font-mono">@{entry.handle}</td>
                          <td className="p-4">{entry.category}</td>
                          <td className="p-4 font-mono">{entry.email.replace(/(?<=.{2}).(?=[^@]*?@)/g, "*")}</td>
                          <td className="p-4 text-dark-muted font-mono">{new Date(entry.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AGENT ORACLE TERMINAL */}
          {activeTab === "agent" && (
            <div className="space-y-8">
              {/* Terminal Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Dynamic AI Terminal Chat (Col 2/3) */}
                <div className="lg:col-span-2 bg-dark-card border border-brand-matrix/20 rounded-2xl overflow-hidden flex flex-col h-[550px] shadow-[0_0_20px_rgba(0,255,102,0.03)]">
                  
                  {/* Console Header */}
                  <div className="px-5 py-4 border-b border-brand-matrix/10 bg-zinc-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-matrix animate-ping"></span>
                      <h4 className="font-cyber font-bold text-white text-sm tracking-wide">ORACLE AI SECURE TERMINAL v1.1</h4>
                    </div>
                    <span className="font-mono text-[10px] text-brand-matrix uppercase">HANDSHAKE ACTIVE</span>
                  </div>

                  {/* Terminal Output Logs */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs text-zinc-300 scrollbar-thin">
                    {agentMessages.map((msg, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-dark-muted">
                          <span>{msg.sender === "user" ? "SYNDICATE-CLIENT" : "ORACLE-NEURAL-NODE"}</span>
                          <span>{msg.time}</span>
                        </div>
                        <div className={`p-3 rounded-lg leading-relaxed whitespace-pre-wrap ${
                          msg.sender === "user" 
                            ? "bg-dark-bg/60 border border-dark-border text-white" 
                            : "bg-brand-matrix/5 border border-brand-matrix/10 text-brand-matrix"
                        }`}>
                          {msg.sender === "user" ? "> " : ""}{msg.text}
                        </div>
                      </div>
                    ))}
                    {isAgentGenerating && (
                      <div className="flex items-center gap-2 text-brand-matrix animate-pulse">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-matrix animate-bounce"></span>
                        <span>Oracle computing response...</span>
                      </div>
                    )}
                  </div>

                  {/* Terminal Input */}
                  <form onSubmit={handleSendAgentMessage} className="p-4 border-t border-brand-matrix/10 bg-zinc-950/40 flex gap-2">
                    <input
                      type="text"
                      value={agentInput}
                      onChange={e => setAgentInput(e.target.value)}
                      placeholder="Ask Oracle about data encryption, ledger transactions, or strip metadata..."
                      disabled={isAgentGenerating}
                      className="flex-1 px-4 py-3 rounded-xl bg-dark-bg/80 border border-brand-matrix/20 text-brand-matrix font-mono text-xs placeholder:text-zinc-700 focus:outline-none focus:border-brand-matrix/60"
                    />
                    <button
                      type="submit"
                      disabled={isAgentGenerating}
                      className="px-5 rounded-xl bg-brand-matrix text-black font-bold text-xs hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      EXECUTE
                    </button>
                  </form>
                </div>

                {/* Agent Control Actions Sidebar (Col 1/3) */}
                <div className="space-y-6">
                  
                  {/* Action 1: Telemetry Scanner */}
                  <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <ShieldCheck className="w-4 h-4 text-brand-matrix" />
                      <h4>Telemetry & Header Audit</h4>
                    </div>
                    <p className="text-xs text-dark-muted leading-relaxed">
                      Run diagnostics on your connection fingerprint to strip HTTP cookies and clear user telemetry nodes.
                    </p>

                    {telemetryLogs.length > 0 && (
                      <div className="bg-black/60 p-3 rounded-lg border border-dark-border font-mono text-[10px] text-zinc-400 h-28 overflow-y-auto space-y-1">
                        {telemetryLogs.map((log, i) => (
                          <div key={i} className={log.includes("clean") ? "text-brand-matrix" : ""}>{log}</div>
                        ))}
                      </div>
                    )}

                    {scanQualityScore !== null && (
                      <div className="p-3 rounded-lg bg-brand-matrix/5 border border-brand-matrix/20 flex items-center justify-between text-xs font-semibold text-brand-matrix">
                        <span>Fingerprint Protection Score:</span>
                        <span>{scanQualityScore}% Clean</span>
                      </div>
                    )}

                    <button
                      onClick={handleRunTelemetryScan}
                      disabled={isScanningTelemetry}
                      className="w-full py-2.5 rounded-xl bg-dark-bg hover:bg-dark-hover border border-dark-border hover:border-brand-matrix/40 text-brand-matrix font-bold text-xs transition-colors cursor-pointer"
                    >
                      {isScanningTelemetry ? "Running Sweep..." : "Execute Scan Sweep"}
                    </button>
                  </div>

                  {/* Action 2: Post Optimizer */}
                  <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-brand-accent" />
                      <h4>Creator Copy Optimizer</h4>
                    </div>
                    
                    <form onSubmit={handleOptimizeContent} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Write raw content copy... (e.g. new song)"
                        value={optRawText}
                        onChange={e => setOptRawText(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-white text-xs"
                      />
                      
                      <div className="flex gap-2">
                        <select
                          value={optNiche}
                          onChange={e => setOptNiche(e.target.value)}
                          className="flex-1 px-2 py-1.5 rounded bg-dark-bg border border-dark-border text-xs text-white"
                        >
                          <option value="Model">Model</option>
                          <option value="Artist">Artist</option>
                          <option value="Journalist">Journalist</option>
                          <option value="Musician">Musician</option>
                        </select>
                        
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-white text-black font-bold text-xs rounded hover:bg-zinc-200 transition-colors cursor-pointer"
                        >
                          Optimize
                        </button>
                      </div>
                    </form>

                    {optResult && (
                      <div className="bg-zinc-950/60 p-3 rounded-lg border border-dark-border text-[11px] text-zinc-300 leading-relaxed relative">
                        <p>{optResult}</p>
                        <button
                          onClick={() => {
                            setNewPostContent(optResult);
                            setNewPostLocked(true);
                            setActiveTab("feed");
                            alert("Copied to Feed drafting content!");
                          }}
                          className="mt-2 text-[10px] text-brand-accent font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Send to Feed Locker &rarr;
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action 3: Creator Financial Pricing Advice */}
                  <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <h4>Creator Pricing Advisor</h4>
                    </div>

                    <form onSubmit={handleCalculatePricing} className="flex gap-2">
                      <select
                        value={advNiche}
                        onChange={e => setAdvNiche(e.target.value)}
                        className="flex-1 px-2 py-1.5 rounded bg-dark-bg border border-dark-border text-xs text-white"
                      >
                        <option value="Model">Model</option>
                        <option value="Artist">Artist</option>
                        <option value="Journalist">Journalist</option>
                        <option value="Musician">Musician</option>
                      </select>

                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-yellow-500 text-black font-bold text-xs rounded hover:bg-yellow-400 transition-colors cursor-pointer"
                      >
                        Calculate
                      </button>
                    </form>

                    {advPriceResult && (
                      <div className="bg-zinc-950/60 p-4 rounded-lg border border-dark-border text-xs text-zinc-300 space-y-2">
                        <div className="flex justify-between items-center font-bold text-yellow-500">
                          <span>Suggested price:</span>
                          <span className="font-mono text-sm">${advPriceResult.suggested.toFixed(2)}/mo</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-dark-muted font-mono">
                          <span>Safe Range:</span>
                          <span>${advPriceResult.min.toFixed(2)} - ${advPriceResult.max.toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-relaxed pt-1.5 border-t border-dark-border/40">
                          {advPriceResult.rationale}
                        </p>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* Tip Creator Modal */}
      {tipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-panel p-6 rounded-2xl border-brand-accent/20">
            <h4 className="font-cyber font-bold text-white text-base mb-2">Support Creator</h4>
            <p className="text-xs text-dark-muted mb-6">Send direct tips. 95% of proceeds transfer directly to the creator's secure wallet.</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {["5", "10", "20", "50"].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setTipAmount(amt)}
                    className={`py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                      tipAmount === amt
                        ? "bg-brand-accent text-black font-bold"
                        : "bg-dark-bg border border-dark-border text-white hover:bg-dark-hover"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold">$</span>
                <input
                  type="number"
                  value={tipAmount}
                  onChange={e => setTipAmount(e.target.value)}
                  placeholder="Custom tip amount..."
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-dark-bg/60 border border-dark-border text-white text-sm font-mono focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setTipModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-dark-card border border-dark-border text-white font-semibold text-xs hover:bg-dark-hover transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendTip}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-xs hover:shadow-[0_0_15px_var(--color-glow-pink)] transition-all cursor-pointer"
                  >
                    Send Tip (Wallet)
                  </button>
                </div>
                <button
                  onClick={() => handleOpenPayPalCheckout(tipCreatorId, parseFloat(tipAmount), true)}
                  className="w-full py-2.5 rounded-xl bg-[#ffc439] hover:bg-[#f2b522] text-[#111] text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="italic font-bold">PayPal</span> Checkout Tip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Sandbox Checkout Simulation Modal Popup */}
      {paypalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans text-zinc-800">
            {/* Header */}
            <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-blue-800 flex items-center gap-0.5">
                  <span className="italic font-black text-blue-900">Pay</span>Pal
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-bold uppercase tracking-wider">
                  Sandbox Checkout
                </span>
              </div>
              <button
                onClick={() => setPaypalModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Content Switch */}
            {paypalSubscriptionStep === "login" && (
              <form onSubmit={handlePayPalSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs text-zinc-500">
                    <span>Merchant:</span>
                    <span className="font-bold text-zinc-800">Omnisphere R18 Syndicate</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500">
                    <span>Payment Detail:</span>
                    <span className="font-bold text-zinc-800">
                      {isPaypalTip ? "Direct Tip Transfer" : "Monthly Creator Access Plan"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500 border-b border-dashed border-zinc-200 pb-3">
                    <span>Plan ID / Ref:</span>
                    <span className="font-mono text-[10px] text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded">
                      {isPaypalTip ? "N/A (One-Time)" : paypalPlanId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-semibold text-zinc-800">Amount Due:</span>
                    <span className="text-lg font-black text-blue-900 font-mono">${paypalAmount.toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="border-t border-zinc-100 pt-4 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500 font-medium">Sandbox Buyer Email</label>
                    <input
                      type="email"
                      required
                      value={paypalEmail}
                      onChange={e => setPaypalEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500 font-medium">Password</label>
                    <input
                      type="password"
                      required
                      value={paypalPassword}
                      onChange={e => setPaypalPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide transition-colors cursor-pointer"
                >
                  Log In & Pay
                </button>
              </form>
            )}

            {paypalSubscriptionStep === "loading" && (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <span className="w-8 h-8 rounded-full border-4 border-zinc-200 border-t-blue-600 animate-spin"></span>
                <p className="text-sm font-medium text-zinc-600">{paypalLoadingText}</p>
              </div>
            )}

            {paypalSubscriptionStep === "approved" && (
              <div className="p-8 text-center space-y-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-zinc-800 text-base">Payment Approved!</h4>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    Agreement ID established successfully. You have authorized merchant recurring charges.
                  </p>
                </div>

                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 font-mono text-[10px] text-zinc-600 flex justify-between">
                  <span>TRANSACTION ID:</span>
                  <span>PP-TX-{Math.floor(100000+Math.random()*900000)}</span>
                </div>

                <button
                  onClick={handlePayPalSuccessAction}
                  className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide transition-colors cursor-pointer"
                >
                  Return to Omnisphere
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
