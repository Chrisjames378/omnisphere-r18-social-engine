import { useState, useEffect } from "react";
import {
  Flame,
  ShieldCheck,
  CheckCircle,
  Database,
  Mail,
  Sparkles,
  AlertTriangle,
  Loader2,
  Copy,
  Info
} from "lucide-react";
import { initSupabase, getSupabase } from "./supabaseClient";

// Niche categories
const CATEGORIES = [
  { value: "Model", label: "Alternative Fashion / Model" },
  { value: "Artist", label: "3D Artist / Animator" },
  { value: "Journalist", label: "Independent Journalist" },
  { value: "Musician", label: "Synth-Pop / Loop Musician" },
  { value: "Other", label: "Other Creative Specialization" }
];

// Initial pre-registered mock handles (to check availability)
const RESERVED_HANDLES = ["cyber_vixen", "pixel_ghost", "shadow_scribe", "user_anon", "alice_cyber", "dark_net_rebel"];

export default function App() {
  // Supabase Live Connection Config
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem("omni_wl_sb_url") || "");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem("omni_wl_sb_key") || "");
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(() => localStorage.getItem("omni_wl_sb_connected") === "true");
  const [showDevPanel, setShowDevPanel] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [category, setCategory] = useState("Model");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Viral referral queue states
  const [referredCount, setReferredCount] = useState(1);
  const [queuePosition, setQueuePosition] = useState(1248);
  const [sharedOnX, setSharedOnX] = useState(false);
  const [joinedDiscord, setJoinedDiscord] = useState(false);
  const [registeredHandle, setRegisteredHandle] = useState("");

  // Handle Availability states
  const [handleStatus, setHandleStatus] = useState<"idle" | "checking" | "taken" | "available">("idle");
  const [checkedHandleText, setCheckedHandleText] = useState("");

  // Waitlist Database logs (Simulated or Live)
  const [entries, setEntries] = useState<{ id: string; email: string; handle: string; category: string; created_at: string }[]>(() => {
    const saved = localStorage.getItem("omni_wl_entries");
    return saved ? JSON.parse(saved) : [
      { id: "1", email: "syndicate-model@proton.me", handle: "vixen_noir_alt", category: "Model", created_at: "2026-06-15T12:00:00Z" },
      { id: "2", email: "censor-free-radio@tutanota.com", handle: "synth_hacker", category: "Musician", created_at: "2026-06-15T11:30:00Z" }
    ];
  });

  // Creator invite pitch copy-paste states
  const [outreachNiche, setOutreachNiche] = useState("Model");
  const [copiedPitch, setCopiedPitch] = useState(false);

  // Sync Supabase URL/Key to localStorage
  useEffect(() => {
    localStorage.setItem("omni_wl_sb_url", supabaseUrl);
    localStorage.setItem("omni_wl_sb_key", supabaseAnonKey);
    localStorage.setItem("omni_wl_sb_connected", String(isSupabaseConnected));
    if (isSupabaseConnected && supabaseUrl && supabaseAnonKey) {
      initSupabase(supabaseUrl, supabaseAnonKey);
    }
  }, [supabaseUrl, supabaseAnonKey, isSupabaseConnected]);

  // Sync waitlist entries locally
  useEffect(() => {
    localStorage.setItem("omni_wl_entries", JSON.stringify(entries));
  }, [entries]);

  // Supabase Polling loop
  useEffect(() => {
    if (!isSupabaseConnected || !supabaseUrl || !supabaseAnonKey) return;

    initSupabase(supabaseUrl, supabaseAnonKey);
    const client = getSupabase();
    if (!client) return;

    const syncEntries = async () => {
      try {
        const { data } = await client.from("waitlist").select("*").order("created_at", { ascending: false });
        if (data && data.length > 0) {
          setEntries(data);
        }
      } catch (err) {
        console.error("Waitlist DB sync error:", err);
      }
    };

    syncEntries();
    const interval = setInterval(syncEntries, 4000);
    return () => clearInterval(interval);
  }, [isSupabaseConnected, supabaseUrl, supabaseAnonKey]);

  // Handle Availability Check Trigger
  useEffect(() => {
    if (!handle.trim()) {
      setHandleStatus("idle");
      return;
    }

    setHandleStatus("checking");
    setCheckedHandleText(handle.toLowerCase().replace("@", ""));

    const delay = setTimeout(async () => {
      const sanitized = handle.toLowerCase().replace("@", "").trim();

      // Check if taken in presets or current waitlist entries
      const takenInPresets = RESERVED_HANDLES.includes(sanitized);
      const takenInWaitlist = entries.some(e => e.handle.toLowerCase() === sanitized);

      let isTaken = takenInPresets || takenInWaitlist;

      if (isSupabaseConnected) {
        const client = getSupabase();
        if (client) {
          try {
            // Check waitlist table
            const { data: wlData } = await client.from("waitlist").select("handle").eq("handle", sanitized);
            // Check profiles table
            const { data: prData } = await client.from("profiles").select("username").eq("username", sanitized);
            
            isTaken = isTaken || (wlData && wlData.length > 0) || (prData && prData.length > 0);
          } catch (err) {
            console.error("DB check failed, falling back to local simulation:", err);
          }
        }
      }

      setHandleStatus(isTaken ? "taken" : "available");
    }, 600);

    return () => clearTimeout(delay);
  }, [handle, entries, isSupabaseConnected]);

  // Submit Reservation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !handle.trim() || handleStatus !== "available" || isSubmitting) return;

    setIsSubmitting(true);
    const sanitizedHandle = handle.toLowerCase().replace("@", "").trim();

    const newEntry = {
      id: `w-${Date.now()}`,
      email: email.trim(),
      handle: sanitizedHandle,
      category,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConnected) {
      const client = getSupabase();
      if (client) {
        try {
          const { error } = await client.from("waitlist").insert({
            email: email.trim(),
            handle: sanitizedHandle,
            category
          });
          if (error) throw new Error(error.message);
        } catch (err: any) {
          alert(`Database Insert Error: ${err.message}`);
          setIsSubmitting(false);
          return;
        }
      }
    } else {
      setEntries(prev => [newEntry, ...prev]);
    }

    setRegisteredHandle(sanitizedHandle);
    setEmail("");
    setHandle("");
    setIsSubmitting(false);
    setSubmitSuccess(true);
  };

  // Niche DM Pitch Copy helper
  const getOutreachPitch = () => {
    if (outreachNiche === "Model") {
      return `Hey! We're launching Omnisphere: an ad-free, R18 social engine. Creators keep 95% of direct subscription & boutique earnings, with total immunity from censorship and telemetry sales. Reserve your handle on our private waitlist portal: [YOUR-VERCEL-URL]`;
    }
    if (outreachNiche === "Artist") {
      return `Hi! Love your Blender lighting renders. We're launching Omnisphere, a zero-telemetry mature social platform. You can share raw .blend packages & 3D commission files directly to subscribers and keep 95% of your earnings. Reserve your handle at: [YOUR-VERCEL-URL]`;
    }
    if (outreachNiche === "Journalist") {
      return `Greetings. We are launching Omnisphere, a zero-telemetry publication engine built on encrypted database structures. No paywalls, no tracking code, and no shadowbans. You keep 95% of direct subscriber reader funds. Secure your pen handle: [YOUR-VERCEL-URL]`;
    }
    if (outreachNiche === "Musician") {
      return `Hey! Love your hardware synth static beats. We're launching Omnisphere R18: a mature social engine. Share loop packs, haptic sound presets, and synth haptics, keeping 95% of checkouts. Secure your artist handle: [YOUR-VERCEL-URL]`;
    }
    return `Reserve your spot on the next-gen zero-telemetry social engine: [YOUR-VERCEL-URL]`;
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(getOutreachPitch());
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-dark-border bg-dark-bg/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-cyber font-black tracking-tighter text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-sm shadow-[0_0_15px_var(--color-glow-pink)]">
                Ω
              </span>
              OMNISPHERE <span className="text-neon-pink">WL</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Portal v1.2
            </span>
          </div>

          <button
            onClick={() => setShowDevPanel(!showDevPanel)}
            className="p-2 rounded-xl bg-dark-card border border-dark-border hover:text-brand-accent hover:border-brand-accent/30 transition-colors text-dark-muted cursor-pointer"
            title="Database Config"
          >
            <Database className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Dev Configuration panel drawer */}
      {showDevPanel && (
        <div className="bg-zinc-950 border-b border-brand-accent/20 p-6 font-mono text-xs text-zinc-300">
          <div className="max-w-4xl mx-auto space-y-4">
            <h3 className="text-brand-accent font-bold flex items-center gap-2 text-sm">
              <Database className="w-4 h-4" /> SUPABASE WAITLIST ENDPOINT
            </h3>
            <p className="text-zinc-500 leading-relaxed text-[11px]">
              Link this waitlist portal directly to your Supabase Project database to sync creator handle reservations instantly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-dark-muted">SUPABASE PROJECT URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-ref.supabase.co"
                  className="w-full px-3 py-2 rounded bg-dark-bg border border-dark-border text-white text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-dark-muted">SUPABASE ANON KEY</label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={e => setSupabaseAnonKey(e.target.value)}
                  placeholder="anonkey..."
                  className="w-full px-3 py-2 rounded bg-dark-bg border border-dark-border text-white text-xs focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  if (!supabaseUrl || !supabaseAnonKey) {
                    alert("Please specify connection details.");
                    return;
                  }
                  setIsSupabaseConnected(true);
                  alert("Connected waitlist to live database!");
                }}
                className={`px-3 py-1.5 rounded font-bold ${
                  isSupabaseConnected ? "bg-brand-matrix/20 border border-brand-matrix text-brand-matrix" : "bg-white text-black hover:bg-zinc-200"
                }`}
              >
                {isSupabaseConnected ? "CONNECTED" : "CONNECT DATABASE"}
              </button>
              {isSupabaseConnected && (
                <button
                  onClick={() => {
                    setIsSupabaseConnected(false);
                    alert("Disconnected.");
                  }}
                  className="px-3 py-1.5 bg-red-950/40 border border-red-500/30 text-red-400 rounded hover:bg-red-900/40"
                >
                  DISCONNECT
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 space-y-12">
        {/* Landing Pitch Section */}
        <section className="text-center space-y-6 relative overflow-hidden p-8 md:p-12 rounded-3xl bg-gradient-to-b from-zinc-950 to-dark-bg border border-dark-border">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl"></div>
          
          <span className="px-3.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest animate-pulse">
            PRE-LAUNCH HANDLE REGISTRATION
          </span>

          <h1 className="text-3xl md:text-5xl font-cyber font-black tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Reserve Your Censor-Free Handle On Omnisphere
          </h1>

          <p className="text-sm text-dark-muted max-w-lg mx-auto leading-relaxed">
            The next-generation ad-free mature R18 engine. Strip telemetry variables, bypass shadowbans, and retain **95%** of direct subscription checkouts.
          </p>

          {/* Checkout Availability Input / Form */}
          <div className="max-w-md mx-auto bg-dark-card border border-dark-border p-6 rounded-2xl space-y-5 text-left">
            {submitSuccess ? (
              <div className="py-4 space-y-6 text-center animate-fade-in">
                <div className="flex flex-col items-center gap-2 text-brand-matrix">
                  <CheckCircle className="w-12 h-12 text-brand-matrix drop-shadow-[0_0_10px_rgba(0,255,102,0.4)]" />
                  <h4 className="font-cyber font-bold text-white text-lg tracking-wide uppercase">Spot Secured!</h4>
                  <p className="text-xs text-dark-muted font-mono bg-dark-bg px-3 py-1 rounded-full border border-dark-border">
                    Handle: @{registeredHandle}
                  </p>
                </div>

                {/* Queue Position Card */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-brand-accent/20 text-center space-y-1">
                  <span className="text-[10px] text-dark-muted uppercase font-bold tracking-widest block">Current Queue Position</span>
                  <h3 className="text-3xl font-mono font-black text-brand-accent drop-shadow-[0_0_12px_rgba(0,242,254,0.3)]">
                    #{queuePosition}
                  </h3>
                  <p className="text-[10px] text-zinc-500">
                    Jump ahead of others by completing launch tasks below.
                  </p>
                </div>

                {/* Referral Link Box */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-dark-muted uppercase">Your Creator Syndicate Invite Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`https://omnisphere.app/join?ref=${registeredHandle}`}
                      className="flex-1 px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-xs text-zinc-400 font-mono focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://omnisphere.app/join?ref=${registeredHandle}`);
                        alert("Referral link copied!");
                      }}
                      className="px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs hover:bg-zinc-700 cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Checklist to Jump Queue */}
                <div className="space-y-3 text-left border-t border-dark-border/40 pt-4">
                  <h5 className="text-[10px] font-cyber font-bold text-white uppercase tracking-wider">🚀 Jump the Queue Checklist</h5>
                  
                  {/* Task 1: Share on X */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-dark-bg/60 border border-dark-border">
                    <div className="flex-1 pr-2">
                      <h6 className="text-xs font-semibold text-white">Broadcast on X / Twitter</h6>
                      <p className="text-[10px] text-dark-muted mt-0.5">Tweet your handle to jump 200 spots</p>
                    </div>
                    <button
                      onClick={() => {
                        if (!sharedOnX) {
                          setSharedOnX(true);
                          setQueuePosition(prev => Math.max(1, prev - 200));
                          const tweetText = encodeURIComponent(`Just secured my censor-free handle @${registeredHandle} on Omnisphere — the decentralized mature social engine with 95% creator splits. Reserve yours: https://omnisphere.app/join?ref=${registeredHandle} @OmnisphereR18`);
                          window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
                        }
                      }}
                      disabled={sharedOnX}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        sharedOnX
                          ? "bg-brand-matrix/10 border border-brand-matrix text-brand-matrix"
                          : "bg-brand-primary text-white hover:bg-brand-primary/80"
                      }`}
                    >
                      {sharedOnX ? "COMPLETED" : "SHARE ON X"}
                    </button>
                  </div>

                  {/* Task 2: Discord Syndicate */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-dark-bg/60 border border-dark-border">
                    <div className="flex-1 pr-2">
                      <h6 className="text-xs font-semibold text-white">Join Discord Syndicate</h6>
                      <p className="text-[10px] text-dark-muted mt-0.5">Connect to developer nodes to jump 150 spots</p>
                    </div>
                    <button
                      onClick={() => {
                        if (!joinedDiscord) {
                          setJoinedDiscord(true);
                          setQueuePosition(prev => Math.max(1, prev - 150));
                          alert("Welcome to the decentralized node syndicate!");
                        }
                      }}
                      disabled={joinedDiscord}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        joinedDiscord
                          ? "bg-brand-matrix/10 border border-brand-matrix text-brand-matrix"
                          : "bg-brand-secondary text-white hover:bg-brand-secondary/80"
                      }`}
                    >
                      {joinedDiscord ? "COMPLETED" : "JOIN DISCORD"}
                    </button>
                  </div>

                  {/* Task 3: Referral Progress */}
                  <div className="p-2.5 rounded-lg bg-dark-bg/60 border border-dark-border space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h6 className="text-xs font-semibold text-white">Invite 3 Creator Friends</h6>
                        <p className="text-[10px] text-dark-muted mt-0.5">Jump 300 spots per referral</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-brand-accent">{referredCount}/3 Joined</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-brand-accent shadow-[0_0_8px_rgba(0,242,254,0.5)] transition-all duration-300"
                        style={{ width: `${(referredCount / 3) * 100}%` }}
                      />
                    </div>
                    {referredCount < 3 && (
                      <button
                        onClick={() => {
                          setReferredCount(prev => prev + 1);
                          setQueuePosition(prev => Math.max(1, prev - 300));
                        }}
                        className="w-full mt-1.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-bold cursor-pointer"
                      >
                        [DEMO] Simulate referral joining
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Secure Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Mail className="w-4 h-4" /></span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="creator@domain.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-bg/60 border border-dark-border text-white text-xs focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                {/* Handle Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Reserve Creator Handle</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold">@</span>
                    <input
                      type="text"
                      required
                      value={handle}
                      onChange={e => setHandle(e.target.value)}
                      placeholder="username"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-dark-bg/60 border border-dark-border text-white text-xs focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  
                  {/* Availability Badge */}
                  {handleStatus !== "idle" && (
                    <div className="flex items-center gap-1.5 pt-1">
                      {handleStatus === "checking" && (
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Verifying availability...</span>
                      )}
                      {handleStatus === "taken" && (
                        <span className="text-[10px] text-brand-primary flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Handle @{checkedHandleText} is already taken.</span>
                      )}
                      {handleStatus === "available" && (
                        <span className="text-[10px] text-brand-matrix flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Handle @{checkedHandleText} is available!</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Specialization Niche</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-xs"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={handleStatus !== "available" || isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm tracking-wide disabled:opacity-50 hover:shadow-[0_0_20px_var(--color-glow-pink)] transition-all cursor-pointer flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Reserve Handle Spot
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Creator Outreach Manager Dashboard */}
        <section className="bg-dark-card border border-dark-border rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-cyber font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                Creator Recruitment Console
              </h2>
              <p className="text-xs text-dark-muted mt-1">
                Admin outreach portal. Copy pitch scripts customized for creator niches.
              </p>
            </div>

            {/* Select Niche */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-dark-muted uppercase">Target Niche:</span>
              <select
                value={outreachNiche}
                onChange={e => setOutreachNiche(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-xs text-white"
              >
                <option value="Model">Alternative Model</option>
                <option value="Artist">3D Artist</option>
                <option value="Journalist">Journalist</option>
                <option value="Musician">Synth Musician</option>
              </select>
            </div>
          </div>

          {/* Pitch Script Output Box */}
          <div className="bg-zinc-950 p-5 rounded-2xl border border-dark-border relative flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="space-y-1 flex-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">INVITE DM PITCH SCRIPT</span>
              <p className="text-xs text-zinc-300 leading-relaxed pt-1.5 font-mono select-all">
                {getOutreachPitch()}
              </p>
            </div>
            
            <button
              onClick={handleCopyPitch}
              className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                copiedPitch 
                  ? "bg-brand-matrix/10 border-brand-matrix text-brand-matrix" 
                  : "bg-white text-black border-transparent hover:bg-zinc-200"
              }`}
            >
              {copiedPitch ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedPitch ? "PITCH COPIED" : "COPY PITCH"}
            </button>
          </div>

          <div className="flex gap-2.5 p-3 rounded-lg bg-brand-primary/5 border border-brand-primary/20 text-[11px] text-zinc-400">
            <Info className="w-4 h-4 text-brand-primary shrink-0" />
            <p className="leading-relaxed">
              **Creator DM Strategy**: Reach out directly to shadowbanned, independent, or Patreon creators on social networks. Presenting the 95% checkout revenue split and no censorship triggers high conversion rates.
            </p>
          </div>
        </section>

        {/* Database Registrations ledger */}
        <section className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-dark-border bg-zinc-950/20">
            <h3 className="font-cyber font-bold text-white text-sm">syndicate Registry reservations ({entries.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-zinc-400">
              <thead>
                <tr className="border-b border-dark-border/40 text-dark-muted font-semibold uppercase tracking-wider bg-zinc-950/10">
                  <th className="p-4">Reserved Handle</th>
                  <th className="p-4">Creator Niche</th>
                  <th className="p-4">Contact Hash</th>
                  <th className="p-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40 font-mono">
                {entries.map(entry => (
                  <tr key={entry.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="p-4 font-bold text-white">@{entry.handle}</td>
                    <td className="p-4 font-sans">{entry.category}</td>
                    <td className="p-4">{entry.email.replace(/(?<=.{2}).(?=[^@]*?@)/g, "*")}</td>
                    <td className="p-4 text-dark-muted">{new Date(entry.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
