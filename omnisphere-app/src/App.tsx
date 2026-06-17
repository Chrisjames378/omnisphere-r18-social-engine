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
  UserCheck,
  Paperclip,
  Trash2,
  FolderArchive,
  Music,
  FileText,
  Binary,
  Download,
  Brain
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
  locked_file?: {
    type: "blend" | "wav" | "pdf" | "zip";
    name: string;
    size: string;
  };
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
    created_at: "2026-06-15T22:30:00Z",
    locked_file: { type: "wav", name: "midnight_static_teaser.wav", size: "4.8 MB" }
  },
  {
    id: "post-2",
    user_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    content: "Behind-the-scenes photoshoot from last night's industrial warehouse session. Uncensored, unfiltered, direct to you. Sub to unlock the full 8K album.",
    media_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    is_locked: true,
    likes_count: 142,
    created_at: "2026-06-15T20:15:00Z",
    locked_file: { type: "zip", name: "industrial_photoshoot_8k.zip", size: "480.2 MB" }
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
    created_at: "2026-06-15T15:00:00Z",
    locked_file: { type: "blend", name: "neon_shader_v1.blend", size: "38.5 MB" }
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
    created_at: "2026-06-15T09:30:00Z",
    locked_file: { type: "pdf", name: "telemetry_brokerage_dossier.pdf", size: "14.1 MB" }
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
    const width = canvas.width = 180;
    const height = canvas.height = 180;

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

function getFileIcon(type: "zip" | "blend" | "wav" | "pdf") {
  switch (type) {
    case "zip":
      return <FolderArchive className="w-6 h-6 text-brand-primary" />;
    case "blend":
      return <Binary className="w-6 h-6 text-orange-400" />;
    case "wav":
      return <Music className="w-6 h-6 text-brand-accent" />;
    case "pdf":
      return <FileText className="w-6 h-6 text-red-500" />;
    default:
      return <FileText className="w-6 h-6 text-zinc-400" />;
  }
}

const generateUniqueId = (prefix: string) => `${prefix}-${Date.now()}`;

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

  // File Download simulation states
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]);

  // Global Telemetry Ticker state
  const [tickerLogs, setTickerLogs] = useState<string[]>([
    "[NODE-USA-E] Handshake secured: ephemeral ECDH tunnel established.",
    "[PWA-CACHE] Stale-while-revalidate thread successfully cached sw.js.",
    "[DATABASE-RLS] Row Level Security verified for waitlist REST lookup.",
    "[TRANS-TX] Creator Seraphina tipped $25.00 via PayPal subscription.",
    "[SECURE-GATE] Age-gate biometric scanner canvas verified at 98.6% confidence.",
    "[SHIELD-BLOCK] Blocked Google Analytics crawler (google-analytics.com).",
    "[NODE-EUR-W] Block Added: hash 0x7fa2b98f2441a"
  ]);

  // Creator Yield Projections
  const [subCount, setSubCount] = useState(2500);
  const [subPrice, setSubPrice] = useState(9.99);
  const [monthlyTips, setMonthlyTips] = useState(1250);

  // Cryptographic ECDH Handshake States
  const [handshakingUserId, setHandshakingUserId] = useState<string | null>(null);
  const [handshakeStep, setHandshakeStep] = useState(0);
  const [handshakeLogs, setHandshakeLogs] = useState<string[]>([]);
  const [securedUsers, setSecuredUsers] = useState<string[]>([]);

  // Omnishield Console States
  const [shieldActive, setShieldActive] = useState(true);
  const [zeroTelemetry, setZeroTelemetry] = useState(true);
  const [antiScrape, setAntiScrape] = useState(true);
  const [p2pChatEncrypt, setP2pChatEncrypt] = useState(true);
  const [shieldLogs, setShieldLogs] = useState<string[]>([
    "[SHIELD] System online. Port scraping detection: ACTIVE.",
    "[SHIELD] Anti-telemetry headers bound to incoming REST queries.",
    "[SHIELD] Local sandboxing mapping initialized for user profiles."
  ]);

  // Upgraded Web Audio Synthesizer parameters
  const [synthWaveType, setSynthWaveType] = useState<"sawtooth" | "square" | "triangle" | "sine">("sawtooth");
  const [synthFrequencyMultiplier, setSynthFrequencyMultiplier] = useState(1.0);
  const [synthVibrato, setSynthVibrato] = useState(2);

  // Real getUserMedia Stream & Live Stream HUD states
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [streamResolution, setStreamResolution] = useState("1280x720");
  const [streamFPS, setStreamFPS] = useState(30);
  const [streamAudioRate, setStreamAudioRate] = useState("48 kHz");
  const [streamLogs, setStreamLogs] = useState<string[]>([
    "Node Connection handshake established.",
    "Decentralized P2P broadcast channel ACTIVE."
  ]);
  const [activeStreamTip, setActiveStreamTip] = useState<{ username: string; amount: number } | null>(null);
  
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // VC Cap Table & Growth Projections
  const [vcPreMoney, setVcPreMoney] = useState(25000000);
  const [vcInvestment, setVcInvestment] = useState(5000000);
  const [vcGrowthRate, setVcGrowthRate] = useState(150);

  // Telemetry ticker simulation loop
  useEffect(() => {
    const systems = ["NODE-USA-E", "NODE-EUR-W", "NODE-ASIA-S", "DB-RLS", "PWA-SW", "SHIELD-BOT"];
    const actions = [
      () => `Block Added: hash 0x${Math.random().toString(16).substring(2, 14)}`,
      () => `Biometric Scan confidence score verified at ${(95.5 + Math.random() * 4.4).toFixed(2)}%`,
      () => `AES-256 Symmetric secret exchange completed for user_${Math.floor(100 + Math.random() * 900)}`,
      () => `Blocked telemetry payload from ${["google-analytics.com", "facebook-pixel", "meta-crawler.bot"][Math.floor(Math.random() * 3)]}`,
      () => `Database read connection pool optimized. RLS latency: ${Math.floor(8 + Math.random() * 15)}ms`,
      () => `Completed Tip: $${(5 + Math.random() * 95).toFixed(2)} to Creator @${["seraphina", "kestrel", "neon_phantom", "atlas_mimi"][Math.floor(Math.random() * 4)]}`
    ];

    const interval = setInterval(() => {
      const randomSys = systems[Math.floor(Math.random() * systems.length)];
      const randomAct = actions[Math.floor(Math.random() * actions.length)]();
      const newLog = `[${randomSys}] ${randomAct}`;
      setTickerLogs(prev => {
        const next = [...prev];
        next.shift();
        next.push(newLog);
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Omnishield blocked crawler ticker simulation
  useEffect(() => {
    if (!shieldActive) return;
    const targets = [
      "Meta crawler (graph.facebook.com) signature rejected.",
      "Google Analytics event beacon dropped (telemetry packet drop).",
      "Advertiser cookie tracker query-parameter stripped.",
      "ByteDance scraper bot attempt shadow-logged and dropped.",
      "User location mapping proxy request spoofed to local isolation.",
      "Telemetry payload to metrics.meta.internal routed to null route."
    ];

    const interval = setInterval(() => {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const timestamp = new Date().toLocaleTimeString();
      setShieldLogs(prev => [`[${timestamp}] [BLOCKED] ${target}`, ...prev.slice(0, 15)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [shieldActive]);

  const startCryptographicHandshake = (userId: string) => {
    if (securedUsers.includes(userId)) {
      setActiveChatUser(userId);
      return;
    }
    
    setHandshakingUserId(userId);
    setHandshakeStep(0);
    setHandshakeLogs([`[HANDSHAKE] Initializing P2P Ephemeral Channel mapping for creator...`]);

    const logs = [
      `[HANDSHAKE] Generating local Secp256k1 Elliptic Curve key pairs...`,
      `[HANDSHAKE] Local Ephemeral Public Key: 04ae4f91bb8d9620ef3942...`,
      `[HANDSHAKE] Exchanging public key signatures with receiver node...`,
      `[HANDSHAKE] Computing shared Diffie-Hellman secret key matrix...`,
      `[HANDSHAKE] Applying HKDF SHA-256 derivation keys...`,
      `[HANDSHAKE] Establishing AES-256-GCM symmetric session token...`,
      `[HANDSHAKE] Handshake established. Ephemeral channel SECURED.`
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step >= logs.length) {
        clearInterval(interval);
        setTimeout(() => {
          setSecuredUsers(prev => [...prev, userId]);
          setActiveChatUser(userId);
          setHandshakingUserId(null);
        }, 500);
        return;
      }
      setHandshakeLogs(prev => [...prev, logs[step]]);
      setHandshakeStep(step + 1);
      step++;
    }, 300);
  };

  const startLiveStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: true
      });
      streamRef.current = mediaStream;
      setIsStreaming(true);
      
      // Bind stream to video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
      
      // Get track details
      const videoTrack = mediaStream.getVideoTracks()[0];
      const audioTrack = mediaStream.getAudioTracks()[0];
      
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        setStreamResolution(`${settings.width || 1280}x${settings.height || 720}`);
        setStreamFPS(Math.round(settings.frameRate || 30));
      }
      if (audioTrack) {
        const settings = audioTrack.getSettings();
        setStreamAudioRate(settings.sampleRate ? `${settings.sampleRate / 1000} kHz` : "48 kHz");
      }
      
      setStreamLogs([
        "[BROADCAST] Camera media tracks successfully bound.",
        "[BROADCAST] Audio capture initialized at 48kHz sampling rate.",
        "[BROADCAST] Ephemeral WebRTC broadcast stream ONLINE."
      ]);
    } catch (err: any) {
      console.error("Failed to acquire camera: ", err);
      alert(`Could not access camera/microphone: ${err.message}. Starting fallback digital visualizer.`);
      setIsStreaming(true);
      setStreamLogs([
        "[BROADCAST] Camera acquisition failed: Permission Denied.",
        "[BROADCAST] Starting fallback digital visualizer stream...",
        "[BROADCAST] Ephemeral fallback broadcast stream ONLINE."
      ]);
    }
  };

  const stopLiveStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setActiveStreamTip(null);
  };

  const toggleMuteStream = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        setStreamLogs(prev => [...prev, `[BROADCAST] Audio track ${audioTrack.enabled ? "UNMUTED" : "MUTED"}.`]);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  // Live stream chat & tipping simulation
  useEffect(() => {
    if (!isStreaming) return;
    
    const comments = [
      "This WebRTC quality is insane. No lag at all!",
      "Wait, is this running completely P2P on our nodes?",
      "Just tipped $10.00! Keep it up!",
      "Zero telemetry live stream, finally a safe space.",
      "Loving the synth arpeggios in the background!",
      "Legacy sites would have banned this stream already.",
      "Is the source mesh file available to download?",
      "Yes, sub to unlock his post attachments below!",
      "Greetings from Berlin node!",
      "P2P packets routing through proxy tunnel successfully."
    ];
    
    const users = ["cypher_punk", "vortex", "hacker_neon", "matrix_coder", "alice_d", "bob_s", "omega_prime", "kestrel_fan"];
    
    // Comments interval
    const chatInterval = setInterval(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomComment = comments[Math.floor(Math.random() * comments.length)];
      setStreamLogs(prev => [...prev, `@${randomUser}: ${randomComment}`].slice(-30)); // Keep last 30
    }, 2500);

    // Tipping alerts interval
    const tipInterval = setInterval(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomAmount = [5, 10, 25, 50, 100][Math.floor(Math.random() * 5)];
      
      setActiveStreamTip({ username: randomUser, amount: randomAmount });
      
      // Auto-add tip log to chat
      setStreamLogs(prev => [...prev, `[TIP ALERT] @${randomUser} tipped $${randomAmount.toFixed(2)}!`]);
      
      // Auto-hide alert after 3 seconds
      setTimeout(() => {
        setActiveStreamTip(null);
      }, 3000);
      
    }, 7000);

    return () => {
      clearInterval(chatInterval);
      clearInterval(tipInterval);
    };
  }, [isStreaming]);

  // Creator File Attachment Console states
  const [hasAttachedFile, setHasAttachedFile] = useState(false);
  const [postFileType, setPostFileType] = useState<"blend" | "wav" | "pdf" | "zip">("zip");
  const [postFileName, setPostFileName] = useState("");
  const [postFileSize, setPostFileSize] = useState("");

  const handleDownloadFile = (postId: string, fileName: string) => {
    if (downloadingFileId) return;
    
    setDownloadingFileId(postId);
    setDownloadProgress(0);
    
    const interval = setInterval(() => {
      setDownloadProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadingFileId(null);
            setDownloadedFiles(prev => [...prev, postId]);
            alert(`Asset download completed: ${fileName} saved to your local offline directory.`);
          }, 400);
          return 100;
        }
        return p + 10;
      });
    }, 120);
  };

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
        
        osc.type = synthWaveType;
        const targetFreq = item.note * synthFrequencyMultiplier;
        osc.frequency.setValueAtTime(targetFreq, now + item.time);
        
        // Add LFO Vibrato Modulation
        if (synthVibrato > 0) {
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(synthVibrato * 3, now + item.time); // LFO Speed
          lfoGain.gain.setValueAtTime(10, now + item.time); // Vibrato Depth
          
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          
          lfo.start(now + item.time);
          lfo.stop(now + item.time + duration);
        }
        
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
  const [approvedPaypalTxId, setApprovedPaypalTxId] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("sandbox-buyer@omnisphere.app");
  const [paypalPassword, setPaypalPassword] = useState("12345678");
  const [paypalClientId, setPaypalClientId] = useState(() => localStorage.getItem("omni_pp_client_id") || "AY0l_0kyQz8hIefxBnrlYDbzn_2tq8pKloNKJKyGi7NBMIWv-zQqUASsNuCqtQsMbaSH8HQbsiOA1oQn");
  const [paypalSecret, setPaypalSecret] = useState(() => localStorage.getItem("omni_pp_secret") || "EEXjH60kSMLiqhgfSLV4_K2Gku3FMmZ8hdWi5B4Zc3aKrGbt0SeGQrvPcATwr6xNn5Z2QJj8-_96Vj7p");
  const [paypalPlanId, setPaypalPlanId] = useState(() => localStorage.getItem("omni_pp_plan_id") || "P-78X90412B789");
  const [paypalLoadingText, setPaypalLoadingText] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem("omni_gemini_api_key") || "");

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

  // PWA Install Prompt state & handlers
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(() => {
    return localStorage.getItem("omni_install_dismissed") !== "true";
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (localStorage.getItem("omni_install_dismissed") !== "true") {
        setShowInstallBanner(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert("Installation protocol ready. To install, select 'Add to Home Screen' from your browser settings or share sheet.");
      dismissInstallBanner();
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install outcome: ${outcome}`);
    setDeferredPrompt(null);
    dismissInstallBanner();
  };

  const dismissInstallBanner = () => {
    localStorage.setItem("omni_install_dismissed", "true");
    setShowInstallBanner(false);
  };

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

  // Sync Gemini API Key settings
  useEffect(() => {
    localStorage.setItem("omni_gemini_api_key", geminiApiKey);
  }, [geminiApiKey]);

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
            is_locked: Boolean(p.is_locked),
            locked_file: p.locked_file ? (typeof p.locked_file === "string" ? JSON.parse(p.locked_file) : p.locked_file) : undefined
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
          setApprovedPaypalTxId(`PP-TX-${Math.floor(100000 + Math.random() * 900000)}`);
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
        id: generateUniqueId("tx-pp"),
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
        id: generateUniqueId("tx-pp"),
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
  const handleSendAgentMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInput.trim() || isAgentGenerating) return;

    const userText = agentInput;
    const newMsg = {
      sender: "user" as const,
      text: userText,
      time: new Date().toLocaleTimeString()
    };

    setAgentMessages(prev => [...prev, newMsg]);
    setAgentInput("");
    setIsAgentGenerating(true);

    const triggerOfflineReply = (txt: string) => {
      const query = txt.toLowerCase();
      let replyText: string;

      if (query.includes("help") || query.includes("menu")) {
        replyText = "Agent Oracle dynamic systems are operational. I can assist you with:\n1. Telemetry Audit: Scan tracking scripts & headers.\n2. Social Content Optimizer: Upgrade your feed copy to fit premium aesthetics.\n3. Creator Financial Advisor: Recommend standard and custom subscription pricing tiers.\n\nSimply run the dashboards below or chat about encryption schemas.";
      } else if (query.includes("encryption") || query.includes("privacy") || query.includes("telemetry") || query.includes("censor")) {
        replyText = "Omnisphere R18 runs under strict database isolation. Standard social platforms log your IP, device identifiers, and sale histories. We employ local storage mapping & RLS rules in our Postgres schemas to secure user communication channels.";
      } else if (query.includes("wallet") || query.includes("money") || query.includes("cash") || query.includes("fee")) {
        replyText = "Creators retain 95% of direct cash flows from tips and subscriptions. The remaining 5% processing fee maintains zero-telemetry hosting nodes. View details in the Wallet ledger.";
      } else if (query.includes("hello") || query.includes("hi ") || query.includes("hey")) {
        replyText = "Greetings. Connection handshake secured. Let me know if you would like me to optimize a feed caption, calculate pricing metrics, or run a diagnostic telemetry sweep.";
      } else {
        replyText = `Audit request logged. Processing: "${txt}". Omnisphere strips telemetry files on image uploads. Let me know if you'd like to perform a live scan or adjust creator subscription prices.`;
      }

      const oracleMsg = {
        sender: "oracle" as const,
        text: replyText,
        time: new Date().toLocaleTimeString()
      };
      setAgentMessages(prev => [...prev, oracleMsg]);
    };

    if (geminiApiKey) {
      try {
        const historyContents = agentMessages.slice(-10).map(m => ({
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: m.text }]
        }));
        
        historyContents.push({
          role: "user",
          parts: [{ text: userText }]
        });

        const systemInstruction = {
          parts: [
            {
              text: "You are Agent Oracle, the advanced AI core for Omnisphere R18 Social Core Engine. Omnisphere is a decentralized, zero-telemetry, censor-free social platform for premium creators. Creators keep 95% of direct cash flows. The app features: 1) Uncensored Feed with premium Monetized File Lockers (ZIP archives, Blender meshes, raw audio wav stems, PDF dossiers); 2) Live DMs with context-aware auto-replies; 3) Wallet Dashboard & creator stats; 4) Age Verification (biometric face scan interface); 5) Standalone Waitlist portal; 6) Live Camera stream HUD with scrolling P2P chat, tipping popups, and live node telemetry; 7) Web Audio Synthesizer arpeggiator widget. Keep your responses short, technical, and formatted in clean markdown. Always align with a cyber-neon, cypherpunk hacker aesthetic."
            }
          ]
        };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
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
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Oracle communication line timed out. Please verify your API settings.";

        const oracleMsg = {
          sender: "oracle" as const,
          text: text,
          time: new Date().toLocaleTimeString()
        };
        setAgentMessages(prev => [...prev, oracleMsg]);
      } catch (err: any) {
        console.error("Gemini API Error:", err);
        const errAlert = {
          sender: "oracle" as const,
          text: `⚠️ [API FAILURE] Connection to Google AI Studio failed: ${err.message}. Falling back to local offline protocols.`,
          time: new Date().toLocaleTimeString()
        };
        setAgentMessages(prev => [...prev, errAlert]);
        
        setTimeout(() => {
          triggerOfflineReply(userText);
        }, 1000);
      } finally {
        setIsAgentGenerating(false);
      }
    } else {
      setTimeout(() => {
        triggerOfflineReply(userText);
        setIsAgentGenerating(false);
      }, 1200);
    }
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

    let result: string;
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
      id: generateUniqueId("tx"),
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
      id: generateUniqueId("tx"),
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

    if (hasAttachedFile && postFileName.trim()) {
      newPost.locked_file = {
        type: postFileType,
        name: postFileName.trim(),
        size: postFileSize.trim() || "15 MB"
      };
    }

    if (isSupabaseConnected) {
      const client = getSupabase();
      if (client) {
        await client.from("posts").insert({
          user_id: "currentUser",
          content: newPostContent,
          media_url: newPostImage.trim() || null,
          is_locked: newPostLocked,
          likes_count: 0,
          locked_file: newPost.locked_file ? JSON.stringify(newPost.locked_file) : null
        });
      }
    } else {
      setPosts(prev => [newPost, ...prev]);
    }

    setNewPostContent("");
    setNewPostImage("");
    setNewPostLocked(false);
    setHasAttachedFile(false);
    setPostFileName("");
    setPostFileSize("");
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

      let replyText: string;
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
        id: generateUniqueId("msg-reply"),
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

            <div className="flex-1 space-y-4 font-mono">
              <h3 className="text-brand-accent font-bold flex items-center gap-2 text-sm">
                <Brain className="w-4 h-4 text-brand-accent" /> GOOGLE AI STUDIO CONFIG
              </h3>
              
              <div className="space-y-1">
                <label className="text-[10px] text-dark-muted">GEMINI API KEY</label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={e => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-1.5 rounded bg-dark-bg border border-dark-border text-white text-xs focus:outline-none font-mono"
                />
              </div>
              
              <p className="text-[10px] text-zinc-500 leading-relaxed pt-1 border-t border-dark-border/40">
                Provide a Gemini API Key to enable the production-grade **Agent Oracle** chatbot using Gemini 2.5 Flash. Leaves it offline if left empty.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Core Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        
        {/* Global Activity HUD Ticker */}
        <div className="w-full bg-zinc-950 border border-dark-border rounded-2xl px-4 py-3 overflow-hidden relative flex items-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 text-xs font-cyber font-bold uppercase tracking-wider shrink-0 text-brand-matrix border-r border-dark-border pr-4">
            <span className="w-2.5 h-2.5 bg-brand-matrix rounded-full animate-ping shrink-0 animate-pulse-slow" />
            <span>Core Telemetry Stream</span>
          </div>
          <div className="w-full overflow-hidden flex whitespace-nowrap pl-4 relative">
            <div className="animate-marquee inline-flex gap-12 text-[11px] font-mono text-zinc-400">
              {tickerLogs.map((log, idx) => (
                <span key={idx} className="inline-flex items-center gap-2">
                  <span className="text-brand-accent">✦</span>
                  {log}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 w-full">
        
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
              {/* Live Creator Stream HUD */}
              <div className="glass-panel-accent p-6 rounded-2xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isStreaming ? "bg-red-500 animate-pulse" : "bg-zinc-600"}`} />
                    <h3 className="font-cyber font-bold text-white text-base tracking-wider uppercase">
                      {isStreaming ? "Live Decentered Broadcast" : "Decentralized P2P Live Broadcast Console"}
                    </h3>
                  </div>
                  {isStreaming && (
                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 bg-black/60 px-3 py-1 rounded-full border border-dark-border">
                      <span className="text-brand-matrix">● SECURE ROUTING: P2P Tunnel</span>
                      <span className="text-brand-accent">FPS: {streamFPS}</span>
                      <span className="text-brand-primary">{streamResolution}</span>
                    </div>
                  )}
                </div>

                {!isStreaming ? (
                  <div className="h-64 rounded-xl bg-zinc-950 border border-dark-border flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary animate-pulse">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-cyber font-bold text-white text-sm">Go Live Instantly and Decentralized</h4>
                      <p className="text-xs text-dark-muted max-w-md mx-auto mt-1">
                        Broadcast directly to your subscribers' browsers with end-to-end encryption. No centralized servers, no transcoding quality loss.
                      </p>
                    </div>
                    <button
                      onClick={startLiveStream}
                      className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs font-cyber tracking-wider hover:bg-brand-primary/80 hover:shadow-[0_0_20px_rgba(255,0,127,0.4)] transition-all cursor-pointer"
                    >
                      START BROADCAST
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Video Preview */}
                    <div className="lg:col-span-2 relative h-80 rounded-xl bg-black border border-brand-primary/40 overflow-hidden shadow-[0_0_25px_rgba(255,0,127,0.15)]">
                      {/* HTML5 Video Element */}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted={isMuted}
                        className="w-full h-full object-cover"
                      />

                      {/* Streaming HUD Overlays */}
                      <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm border border-brand-primary/30 px-3 py-1.5 rounded-lg text-[10px] font-mono text-zinc-300 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                          <span className="text-white font-bold">LIVE BROADCAST</span>
                        </div>
                        <div>RES: <span className="text-brand-accent">{streamResolution}</span></div>
                        <div>FPS: <span className="text-brand-matrix">{streamFPS}</span></div>
                        <div>AUDIO: <span className="text-brand-primary">{streamAudioRate}</span></div>
                        <div>LATENCY: <span className="text-yellow-400">0.04s (P2P)</span></div>
                      </div>

                      {/* Tip Alert overlay */}
                      {activeStreamTip && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                          <div className="glass-panel-fuchsia p-6 rounded-2xl text-center border-2 border-brand-primary shadow-[0_0_30px_rgba(255,0,127,0.4)] animate-bounce-slow">
                            <span className="text-2xl">💎</span>
                            <h4 className="font-cyber font-bold text-white text-lg mt-2 font-mono">
                              @{activeStreamTip.username}
                            </h4>
                            <p className="text-xs text-brand-primary font-bold mt-1 uppercase tracking-widest font-cyber">
                              Tipped ${activeStreamTip.amount.toFixed(2)}!
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Controls Overlay */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <button
                          onClick={toggleMuteStream}
                          className={`px-3 py-1.5 rounded-lg text-xs font-cyber font-semibold border transition-all cursor-pointer ${
                            isMuted
                              ? "bg-red-500/20 border-red-500 text-red-400"
                              : "bg-black/60 border-dark-border text-white hover:bg-black/80"
                          }`}
                        >
                          {isMuted ? "UNMUTE MIC" : "MUTE MIC"}
                        </button>
                        <button
                          onClick={stopLiveStream}
                          className="px-3 py-1.5 rounded-lg text-xs font-cyber font-semibold bg-red-600 border border-red-500 text-white hover:bg-red-700 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
                        >
                          END STREAM
                        </button>
                      </div>
                    </div>

                    {/* Live Chat Log Dashboard */}
                    <div className="h-80 rounded-xl bg-zinc-950 border border-dark-border flex flex-col justify-between overflow-hidden">
                      <div className="p-3 border-b border-dark-border bg-dark-bg/60 flex items-center justify-between">
                        <span className="text-xs font-cyber font-bold text-white uppercase tracking-wider">Decentralized P2P Chat</span>
                        <span className="text-[10px] text-brand-matrix font-mono">ON-CHAIN LOGS</span>
                      </div>
                      <div className="flex-1 p-3 overflow-y-auto font-mono text-[10px] space-y-2 flex flex-col-reverse justify-start">
                        {[...streamLogs].reverse().map((log, idx) => {
                          const isTipAlert = log.includes("[TIP ALERT]");
                          const isBroadcast = log.includes("[BROADCAST]");
                          
                          let textColor = "text-zinc-400";
                          if (isTipAlert) textColor = "text-brand-primary font-bold";
                          else if (isBroadcast) textColor = "text-brand-accent";
                          else if (log.startsWith("@")) textColor = "text-white";

                          return (
                            <div key={idx} className={`${textColor} break-all bg-dark-bg/30 p-1.5 rounded border border-dark-border/20`}>
                              {log}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

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

                {/* File Attachment Configuration Console */}
                {hasAttachedFile && (
                  <div className="p-4 rounded-xl bg-zinc-950 border border-brand-accent/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-brand-accent" />
                        <span className="text-xs font-cyber font-bold text-white uppercase tracking-wider">Premium File Locker Console</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setHasAttachedFile(false);
                          setPostFileName("");
                          setPostFileSize("");
                        }}
                        className="text-dark-muted hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-dark-muted uppercase font-bold mb-1.5">File Type</label>
                        <select
                          value={postFileType}
                          onChange={e => setPostFileType(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-xs text-white focus:outline-none focus:border-brand-accent"
                        >
                          <option value="zip">ZIP Archive (.zip)</option>
                          <option value="blend">Blender 3D Mesh (.blend)</option>
                          <option value="wav">HQ Audio Stem (.wav)</option>
                          <option value="pdf">Leak Dossier (.pdf)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-dark-muted uppercase font-bold mb-1.5">File Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. exclusive_textures.zip"
                          value={postFileName}
                          onChange={e => setPostFileName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-xs text-white focus:outline-none focus:border-brand-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-dark-muted uppercase font-bold mb-1.5">File Size</label>
                        <input
                          type="text"
                          placeholder="e.g. 24.5 MB"
                          value={postFileSize}
                          onChange={e => setPostFileSize(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-xs text-white focus:outline-none focus:border-brand-accent"
                        />
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-dark-muted">
                      💡 Locked files are only accessible to subscribers. Ensure "Lock for Subscribers" is checked to monetize this file!
                    </p>
                  </div>
                )}

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

                    {/* Premium File Attachment Toggle */}
                    <button
                      type="button"
                      onClick={() => setHasAttachedFile(!hasAttachedFile)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        hasAttachedFile
                          ? "bg-brand-accent/20 border-brand-accent text-brand-accent shadow-[0_0_10px_rgba(0,242,254,0.2)]"
                          : "bg-dark-bg/60 border-dark-border text-dark-muted hover:text-white hover:border-zinc-700"
                      }`}
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      {hasAttachedFile ? "Premium File Attached" : "Attach Premium File"}
                    </button>
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
                            {/* Locked Premium File Teaser Card */}
                            {post.locked_file && (
                              <div className="mb-5 px-3.5 py-2 rounded-xl bg-black/50 border border-brand-primary/20 flex items-center gap-3 text-left w-full max-w-xs shadow-[0_0_15px_rgba(255,0,127,0.05)]">
                                <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 shrink-0">
                                  {getFileIcon(post.locked_file.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-bold text-zinc-300 block truncate">{post.locked_file.name}</span>
                                  <span className="text-[10px] text-dark-muted block mt-0.5">{post.locked_file.size} • Locked Premium File</span>
                                </div>
                                <Lock className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                              </div>
                            )}

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

                          {/* Premium File Locker Card */}
                          {post.locked_file && (
                            <div className="mx-5 my-4 p-4 rounded-xl bg-zinc-950 border border-dark-border flex flex-col gap-3">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="p-2 rounded bg-dark-bg border border-dark-border shrink-0">
                                    {getFileIcon(post.locked_file.type)}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-white block truncate">{post.locked_file.name}</span>
                                    <span className="text-[10px] text-dark-muted block mt-0.5">
                                      {post.locked_file.size} • {post.locked_file.type.toUpperCase()} File
                                    </span>
                                  </div>
                                </div>

                                <div className="shrink-0">
                                  {downloadingFileId === post.id ? (
                                    <div className="text-right">
                                      <span className="text-[10px] font-mono text-brand-accent uppercase tracking-wider font-bold">
                                        Downloading
                                      </span>
                                    </div>
                                  ) : downloadedFiles.includes(post.id) ? (
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1 text-brand-matrix text-xs font-bold">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>Saved</span>
                                      </div>
                                      <button
                                        onClick={() => handleDownloadFile(post.id, post.locked_file!.name)}
                                        className="text-[10px] text-dark-muted hover:text-white underline cursor-pointer"
                                      >
                                        Re-download
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleDownloadFile(post.id, post.locked_file!.name)}
                                      className="px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border hover:border-brand-accent text-brand-accent text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      Download
                                    </button>
                                  )}
                                </div>
                              </div>

                              {downloadingFileId === post.id && (
                                <div className="space-y-1.5 pt-2 border-t border-dark-border/40">
                                  <div className="flex justify-between text-[10px] font-mono text-dark-muted">
                                    <span>
                                      {(() => {
                                        const match = post.locked_file.size.match(/^([\d.]+)\s*(\w+)/);
                                        const sizeVal = match ? parseFloat(match[1]) : 0;
                                        const sizeUnit = match ? match[2] : "MB";
                                        return `${((downloadProgress / 100) * sizeVal).toFixed(1)} ${sizeUnit} / ${post.locked_file.size}`;
                                      })()}
                                    </span>
                                    <span>
                                      {(downloadProgress * 0.8).toFixed(1)} MB/s • {downloadProgress}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full bg-dark-bg rounded-full overflow-hidden border border-dark-border/50">
                                    <div
                                      className="h-full bg-gradient-to-r from-brand-accent via-brand-secondary to-brand-primary transition-all duration-150"
                                      style={{ width: `${downloadProgress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
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

                              {/* Wave parameters */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-dark-border/40">
                                <div>
                                  <label className="block text-[8px] text-dark-muted uppercase font-bold mb-1">Oscillator Wave</label>
                                  <select
                                    value={synthWaveType}
                                    onChange={e => setSynthWaveType(e.target.value as any)}
                                    className="w-full px-2 py-1 rounded bg-dark-bg border border-dark-border text-[10px] text-white focus:outline-none"
                                  >
                                    <option value="sawtooth">Sawtooth</option>
                                    <option value="square">Square</option>
                                    <option value="triangle">Triangle</option>
                                    <option value="sine">Sine</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-[8px] text-dark-muted uppercase font-bold mb-1">
                                    <span>Pitch Scale</span>
                                    <span className="font-mono text-zinc-400">{synthFrequencyMultiplier.toFixed(1)}x</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0.5"
                                    max="2.0"
                                    step="0.1"
                                    value={synthFrequencyMultiplier}
                                    onChange={e => setSynthFrequencyMultiplier(parseFloat(e.target.value))}
                                    className="w-full accent-brand-accent h-1 bg-zinc-900 rounded cursor-pointer"
                                  />
                                </div>

                                <div>
                                  <div className="flex justify-between text-[8px] text-dark-muted uppercase font-bold mb-1">
                                    <span>LFO Vibrato</span>
                                    <span className="font-mono text-zinc-400">{synthVibrato}Hz</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="1"
                                    value={synthVibrato}
                                    onChange={e => setSynthVibrato(parseInt(e.target.value))}
                                    className="w-full accent-brand-secondary h-1 bg-zinc-900 rounded cursor-pointer"
                                  />
                                </div>
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
                                startCryptographicHandshake(author.id);
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
                          onClick={() => startCryptographicHandshake(creator.id)}
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

              <div className="flex-1 flex flex-col bg-dark-bg/20">
                {handshakingUserId ? (
                  (() => {
                    const creator = profiles.find(p => p.id === handshakingUserId);
                    if (!creator) return null;
                    return (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950/60 font-mono text-xs text-brand-matrix space-y-6">
                        <div className="w-16 h-16 rounded-full bg-brand-matrix/10 border border-brand-matrix/30 flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(0,255,102,0.25)]">
                          <Lock className="w-6 h-6 text-brand-matrix" />
                        </div>
                        <div className="max-w-md w-full text-center space-y-4">
                          <h4 className="font-cyber font-bold text-white text-sm uppercase tracking-wider">Establishing Ephemeral P2P Tunnel</h4>
                          <p className="text-zinc-500 text-[10px]">ECDH key exchange handshake with @{creator.username}</p>
                          
                          {/* Progress bar */}
                          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                            <div 
                              className="h-full bg-brand-matrix transition-all duration-300 shadow-[0_0_10px_rgba(0,255,102,0.6)]" 
                              style={{ width: `${((handshakeStep + 1) / 8) * 100}%` }}
                            />
                          </div>

                          {/* Handshake logs */}
                          <div className="p-4 rounded-xl bg-black border border-dark-border text-left space-y-2 h-48 overflow-y-auto font-mono text-[10px] text-zinc-400">
                            {handshakeLogs.map((log, idx) => (
                              <div key={idx} className={idx === handshakeLogs.length - 1 ? "text-brand-matrix font-bold" : ""}>
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : activeChatUser ? (
                  (() => {
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

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-brand-matrix bg-brand-matrix/10 border border-brand-matrix/30 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                              <ShieldCheck className="w-3 h-3" /> P2P SECURED
                            </span>
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
                                      ? "bg-brand-secondary text-white rounded-tr-none shadow-[0_0_12px_rgba(138,43,226,0.15)]"
                                      : "bg-zinc-900 border border-dark-border text-zinc-300 rounded-tl-none"
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
                  })()
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-zinc-950/10">
                    <div className="w-12 h-12 rounded-full bg-dark-border/40 flex items-center justify-center text-dark-muted mb-4 border border-dark-border">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h5 className="font-cyber font-bold text-white text-sm uppercase tracking-wider">Secure Communications Tunnel</h5>
                    <p className="text-xs text-dark-muted mt-1.5 max-w-xs leading-relaxed">
                      Select a creator from the sidebar to establish an ephemeral, cryptographic P2P key-exchange handshake.
                    </p>
                  </div>
                )}
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

              {/* Zuckerberg-Killer Yield Projections Console */}
              {(() => {
                const grossMonthly = (subCount * subPrice) + monthlyTips;
                const omniNet = grossMonthly * 0.95;
                const legacyNet = grossMonthly * 0.60;
                const savedBonus = omniNet - legacyNet;

                const maxRev = Math.max(10000, (10000 * subPrice) + monthlyTips);
                const getXY = (s: number, split: number) => {
                  const rev = (s * subPrice + monthlyTips) * split;
                  const x = (s / 10000) * 320 + 40;
                  const y = 140 - (rev / maxRev) * 110 - 15;
                  return `${x},${y}`;
                };
                const omniPath = `M ${getXY(0, 0.95)} L ${getXY(2500, 0.95)} L ${getXY(5000, 0.95)} L ${getXY(7500, 0.95)} L ${getXY(10000, 0.95)}`;
                const legacyPath = `M ${getXY(0, 0.60)} L ${getXY(2500, 0.60)} L ${getXY(5000, 0.60)} L ${getXY(7500, 0.60)} L ${getXY(10000, 0.60)}`;
                const currentX = (subCount / 10000) * 320 + 40;

                return (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Sliders and Splits Console (Col 1 & 2) */}
                      <div className="lg:col-span-2 bg-dark-card border border-dark-border p-6 rounded-2xl space-y-6">
                        <div>
                          <h3 className="font-cyber font-bold text-white text-base">Venture Capital & Creator Yield Modeling Engine</h3>
                          <p className="text-xs text-dark-muted mt-1">
                            Simulate direct monetization models. Compare the flat 5% fee model of Omnisphere R18 against legacy tech monopolies.
                          </p>
                        </div>

                        {/* Sliders */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-dark-muted">SUBSCRIBERS</span>
                              <span className="font-mono text-white font-bold">{subCount.toLocaleString()}</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10000"
                              step="100"
                              value={subCount}
                              onChange={e => setSubCount(parseInt(e.target.value))}
                              className="w-full accent-brand-primary h-1 bg-zinc-800 rounded-lg cursor-pointer"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-dark-muted">SUB PRICE</span>
                              <span className="font-mono text-white font-bold">${subPrice.toFixed(2)}</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="100"
                              step="0.5"
                              value={subPrice}
                              onChange={e => setSubPrice(parseFloat(e.target.value))}
                              className="w-full accent-brand-secondary h-1 bg-zinc-800 rounded-lg cursor-pointer"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-dark-muted">ESTIMATED TIPS / MO</span>
                              <span className="font-mono text-white font-bold">${monthlyTips.toLocaleString()}</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10000"
                              step="50"
                              value={monthlyTips}
                              onChange={e => setMonthlyTips(parseInt(e.target.value))}
                              className="w-full accent-brand-accent h-1 bg-zinc-800 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Yield Comparison Card */}
                        <div className="p-4 rounded-xl bg-zinc-950 border border-dark-border grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <span className="text-[10px] text-dark-muted uppercase font-bold">Gross Monthly Flow</span>
                            <h4 className="text-lg font-mono font-black text-white mt-1">${grossMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                          </div>
                          <div>
                            <span className="text-[10px] text-brand-primary uppercase font-bold">Omnisphere Net (95%)</span>
                            <h4 className="text-lg font-mono font-black text-brand-primary mt-1">${omniNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                          </div>
                          <div>
                            <span className="text-[10px] text-dark-muted uppercase font-bold">Legacy Net (60%)</span>
                            <h4 className="text-lg font-mono font-black text-zinc-400 mt-1">${legacyNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                          </div>
                          <div className="bg-brand-accent/5 border border-brand-accent/20 rounded-lg p-2 flex flex-col justify-center">
                            <span className="text-[9px] text-brand-accent uppercase font-bold tracking-wider">Creator saved yield</span>
                            <h4 className="text-base font-mono font-black text-brand-accent mt-0.5">+${savedBonus.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</h4>
                          </div>
                        </div>
                      </div>

                      {/* SVG Graph Panel (Col 3) */}
                      <div className="bg-dark-card border border-dark-border p-6 rounded-2xl flex flex-col justify-between">
                        <div>
                          <h4 className="font-cyber font-bold text-white text-sm">Monthly Earnings Curve</h4>
                          <p className="text-[10px] text-dark-muted mt-0.5">Fuchsia: Omnisphere | Grey: Legacy platform splits</p>
                        </div>

                        <div className="relative w-full h-36 mt-4 bg-zinc-950/60 rounded-xl border border-dark-border/40 overflow-hidden">
                          <svg className="w-full h-full" viewBox="0 0 400 150">
                            {/* Grid Lines */}
                            <line x1="40" y1="15" x2="380" y2="15" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3,3" />
                            <line x1="40" y1="70" x2="380" y2="70" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3,3" />
                            <line x1="40" y1="125" x2="380" y2="125" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3,3" />

                            {/* Path lines */}
                            <path d={legacyPath} fill="none" stroke="#52525b" strokeWidth="2.5" strokeLinecap="round" />
                            <path d={omniPath} fill="none" stroke="var(--color-brand-primary)" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(255,0,127,0.4)]" />

                            {/* Current pointer vertical line */}
                            <line x1={currentX} y1="15" x2={currentX} y2="125" stroke="var(--color-brand-accent)" strokeWidth="1" strokeDasharray="2,2" />
                            <circle cx={currentX} cy={140 - (((subCount * subPrice + monthlyTips) * 0.95) / maxRev) * 110 - 15} r="4.5" fill="var(--color-brand-accent)" />

                            {/* Axis labels */}
                            <text x="40" y="145" fill="#71717a" fontSize="8" fontFamily="monospace">0</text>
                            <text x="200" y="145" fill="#71717a" fontSize="8" fontFamily="monospace" textAnchor="middle">5k subs</text>
                            <text x="360" y="145" fill="#71717a" fontSize="8" fontFamily="monospace" textAnchor="end">10k subs</text>
                            
                            <text x="35" y="20" fill="#71717a" fontSize="8" fontFamily="monospace" textAnchor="end">Max</text>
                            <text x="35" y="128" fill="#71717a" fontSize="8" fontFamily="monospace" textAnchor="end">Min</text>
                          </svg>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-3">
                          <span>*Calculated based on 95% payout splits.</span>
                          <span className="text-brand-accent font-bold">Active Node Sync: LIVE</span>
                        </div>
                      </div>
                    </div>

                    {/* Platform Splits Economics & Investor Dashboard */}
                    <div className="bg-dark-card border border-dark-border p-6 rounded-2xl">
                      <h3 className="font-cyber font-bold text-white text-base mb-4">Decentralized Platform Economics vs Legacy Web2</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="space-y-2 p-4 rounded-xl bg-zinc-950/40 border border-dark-border/60">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Creator Revenue Autonomy</span>
                          <h5 className="font-bold text-white">95% Creator Share Payout</h5>
                          <p className="text-xs text-dark-muted leading-relaxed">
                            Instead of taking 30% to 50% cuts for database indexing and content distribution, Omnisphere R18 charges a flat 5% split. All storage hashes are routed directly.
                          </p>
                        </div>
                        
                        <div className="space-y-2 p-4 rounded-xl bg-zinc-950/40 border border-dark-border/60">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">VC Valuation Metrics</span>
                          <h5 className="font-bold text-white">Infinite Creator LTV/CAC Ratio</h5>
                          <p className="text-xs text-dark-muted leading-relaxed">
                            With zero-telemetry local caching, user data retention costs are virtually zero. This yields highly optimized EBITDA margins, allowing the platform to scale with negligible overhead.
                          </p>
                        </div>

                        <div className="space-y-2 p-4 rounded-xl bg-zinc-950/40 border border-dark-border/60">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Zero Shadowbans Guarantee</span>
                          <h5 className="font-bold text-white">Postgres RLS Isolation</h5>
                          <p className="text-xs text-dark-muted leading-relaxed">
                            Accounts cannot be shadowbanned or deleted by centralized algorithmic filters. Database Row Level Security rules protect and isolate all creator profiles.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* VC Cap Table & Growth Projections Simulator */}
                    <div className="bg-dark-card border border-dark-border p-6 rounded-2xl space-y-6">
                      <div>
                        <h3 className="font-cyber font-bold text-white text-base">VC Cap Table & Investment Yield Simulator</h3>
                        <p className="text-xs text-dark-muted mt-1">
                          Simulate valuation models, investment sizing, and projected ROI under the Omnisphere R18 Social Core Engine.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Sliders */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-dark-muted">PRE-MONEY VALUATION</span>
                              <span className="font-mono text-white font-bold">${(vcPreMoney / 1000000).toFixed(1)}M</span>
                            </div>
                            <input
                              type="range"
                              min={5000000}
                              max={100000000}
                              step={1000000}
                              value={vcPreMoney}
                              onChange={e => setVcPreMoney(parseInt(e.target.value))}
                              className="w-full accent-brand-primary h-1 bg-zinc-800 rounded-lg cursor-pointer"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-dark-muted">INVESTMENT SIZE</span>
                              <span className="font-mono text-white font-bold">${(vcInvestment / 1000000).toFixed(2)}M</span>
                            </div>
                            <input
                              type="range"
                              min={100000}
                              max={10000000}
                              step={100000}
                              value={vcInvestment}
                              onChange={e => setVcInvestment(parseInt(e.target.value))}
                              className="w-full accent-brand-secondary h-1 bg-zinc-800 rounded-lg cursor-pointer"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-dark-muted">ANNUAL CREATOR GROWTH</span>
                              <span className="font-mono text-white font-bold">+{vcGrowthRate}%</span>
                            </div>
                            <input
                              type="range"
                              min={50}
                              max={500}
                              step={10}
                              value={vcGrowthRate}
                              onChange={e => setVcGrowthRate(parseInt(e.target.value))}
                              className="w-full accent-brand-accent h-1 bg-zinc-800 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Real-time ROI Projections Cards */}
                        {(() => {
                          const postMoney = vcPreMoney + vcInvestment;
                          const equityShare = (vcInvestment / postMoney) * 100;
                          const baseVol = 10000000;
                          const platformFee = 0.05;
                          const y1Rev = baseVol * platformFee;
                          const y2Rev = y1Rev * (1 + vcGrowthRate / 100);
                          const y3Rev = y2Rev * (1 + vcGrowthRate / 100);
                          const total3YrRev = y1Rev + y2Rev + y3Rev;
                          const vcShareOfRevenue = total3YrRev * (equityShare / 100);
                          const roiMultiple = vcShareOfRevenue / vcInvestment;

                          return (
                            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl bg-zinc-950 border border-dark-border flex flex-col justify-between">
                                <div>
                                  <span className="text-[10px] text-dark-muted uppercase font-bold">Post-Money Valuation</span>
                                  <h4 className="text-xl font-mono font-black text-white mt-1">
                                    ${(postMoney / 1000000).toFixed(2)}M
                                  </h4>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-2">
                                  Pre-Money valuation plus new cash injected.
                                </p>
                              </div>

                              <div className="p-4 rounded-xl bg-zinc-950 border border-dark-border flex flex-col justify-between">
                                <div>
                                  <span className="text-[10px] text-brand-primary uppercase font-bold">Equity Share Ownership</span>
                                  <h4 className="text-xl font-mono font-black text-brand-primary mt-1">
                                    {equityShare.toFixed(2)}%
                                  </h4>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-2">
                                  Calculated dilution based on investment size.
                                </p>
                              </div>

                              <div className="p-4 rounded-xl bg-zinc-950 border border-dark-border flex flex-col justify-between">
                                <div>
                                  <span className="text-[10px] text-brand-accent uppercase font-bold">Projected 3-Yr Cumulative Fees</span>
                                  <h4 className="text-xl font-mono font-black text-brand-accent mt-1">
                                    ${(total3YrRev / 1000000).toFixed(2)}M
                                  </h4>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-2">
                                  Total 5% platform fees collected over 3 years.
                                </p>
                              </div>

                              <div className="p-4 rounded-xl bg-zinc-950 border border-brand-matrix/20 flex flex-col justify-between shadow-[0_0_15px_rgba(0,255,100,0.05)]">
                                <div>
                                  <span className="text-[10px] text-brand-matrix uppercase font-bold">VC Share & Projected ROI</span>
                                  <h4 className="text-xl font-mono font-black text-brand-matrix mt-1">
                                    ${(vcShareOfRevenue / 1000000).toFixed(2)}M ({roiMultiple.toFixed(2)}x)
                                  </h4>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-2">
                                  Projected returns from 5% flat fee cashflow splits.
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </>
                );
              })()}
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
                            id: generateUniqueId("tx-dep"),
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
                            id: generateUniqueId("tx-wth"),
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

                  {/* Action 4: Omnishield Anti-Scraping Console */}
                  <div className="bg-dark-card border border-brand-accent/20 p-5 rounded-2xl space-y-4 shadow-[0_0_15px_rgba(0,240,255,0.02)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <ShieldAlert className="w-4 h-4 text-brand-accent animate-pulse" />
                        <h4>Omnishield Security HUD</h4>
                      </div>
                      <span className="font-mono text-[9px] text-brand-accent uppercase tracking-wider font-bold">
                        {shieldActive ? "Shields Active" : "Shields Offline"}
                      </span>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-2.5 pt-2 border-t border-dark-border/40">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-300 font-semibold">Zero-Telemetry Sandbox</span>
                        <input
                          type="checkbox"
                          checked={zeroTelemetry}
                          onChange={e => setZeroTelemetry(e.target.checked)}
                          className="rounded border-dark-border bg-dark-bg text-brand-accent focus:ring-brand-accent cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-300 font-semibold">Anti-Scrape Crawler Shield</span>
                        <input
                          type="checkbox"
                          checked={antiScrape}
                          onChange={e => setAntiScrape(e.target.checked)}
                          className="rounded border-dark-border bg-dark-bg text-brand-accent focus:ring-brand-accent cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-300 font-semibold">P2P Channel Encryption</span>
                        <input
                          type="checkbox"
                          checked={p2pChatEncrypt}
                          onChange={e => setP2pChatEncrypt(e.target.checked)}
                          className="rounded border-dark-border bg-dark-bg text-brand-accent focus:ring-brand-accent cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-300 font-semibold">Decentralized Routing</span>
                        <input
                          type="checkbox"
                          checked={shieldActive}
                          onChange={e => setShieldActive(e.target.checked)}
                          className="rounded border-dark-border bg-dark-bg text-brand-accent focus:ring-brand-accent cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Live Crawler Monitor Log */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider block">Intrusion Logs</span>
                      <div className="p-3 rounded-lg bg-black border border-dark-border/80 font-mono text-[9px] text-zinc-400 h-28 overflow-y-auto space-y-1.5 scrollbar-thin">
                        {shieldLogs.map((log, idx) => (
                          <div key={idx} className={log.includes("[BLOCKED]") ? "text-brand-accent" : ""}>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>
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
                  <span>{approvedPaypalTxId}</span>
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

      {/* PWA Install Promo Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50 glass-panel-fuchsia p-5 rounded-2xl border border-brand-primary/40 shadow-[0_0_30px_rgba(255,0,127,0.35)] animate-fade-in flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
                <span className="text-lg font-cyber font-black">Ω</span>
              </div>
              <div className="text-left">
                <h4 className="font-cyber font-bold text-white text-xs uppercase tracking-wider">Install Omnisphere Core</h4>
                <p className="text-[10px] text-dark-muted mt-0.5">Bypass app stores. Install zero-telemetry PWA.</p>
              </div>
            </div>
            <button
              onClick={dismissInstallBanner}
              className="text-zinc-500 hover:text-zinc-300 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed font-mono text-left">
            Get offline node caching, full-screen biometric logins, and secure local database sandboxing directly on your device.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstallPWA}
              className="flex-1 py-2 rounded-xl bg-white text-black font-bold text-xs font-cyber tracking-wider hover:bg-zinc-200 transition-all cursor-pointer text-center"
            >
              ADD TO HOME SCREEN
            </button>
            <button
              onClick={dismissInstallBanner}
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white text-xs cursor-pointer font-mono"
            >
              Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
