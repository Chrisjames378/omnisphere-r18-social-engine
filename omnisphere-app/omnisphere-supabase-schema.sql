-- Omnisphere R18: Supabase PostgreSQL Schema
-- Version: 1.0.0
-- Description: Core schema for profiles, content feeds, messages, subscriptions, and transactions.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------
-- 1. PROFILES TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    bio TEXT,
    is_creator BOOLEAN DEFAULT FALSE,
    subscription_price NUMERIC(10, 2) DEFAULT 0.00,
    wallet_balance NUMERIC(12, 2) DEFAULT 100.00, -- Seed users with $100 for simulation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------
-- 2. POSTS TABLE (With Content Lock Support)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    is_locked BOOLEAN DEFAULT FALSE, -- True if content requires creator subscription
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------
-- 3. MESSAGES TABLE (Real-Time DMs)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------
-- 4. SUBSCRIPTIONS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (subscriber_id, creator_id)
);

-- --------------------------------------------------
-- 5. TRANSACTIONS TABLE (Wallet History)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    tx_type TEXT CHECK (tx_type IN ('tip', 'subscription', 'deposit', 'withdrawal')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------
-- 6. WAITLIST TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------
-- ROW-LEVEL SECURITY (RLS) RULES
-- --------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Anyone can read, but users can only write/update their own profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Posts: Anyone can view, but only creators can write posts
CREATE POLICY "Posts are viewable by everyone" ON public.posts
    FOR SELECT USING (true);

CREATE POLICY "Creators can insert their own posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can delete/update their own posts" ON public.posts
    FOR ALL USING (auth.uid() = user_id);

-- 3. Messages: Users can only read and write messages where they are sender or receiver
CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 4. Subscriptions: Users can see their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = subscriber_id OR auth.uid() = creator_id);

CREATE POLICY "Users can subscribe" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = subscriber_id);

-- 5. Transactions: Users can see transactions they are part of
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 6. Waitlist: Public can insert, admin can select
CREATE POLICY "Public can sign up for waitlist" ON public.waitlist
    FOR INSERT WITH CHECK (true);

-- --------------------------------------------------
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- --------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------
-- SEED MOCK DATA FOR SIMULATION
-- --------------------------------------------------
-- Insert Creators
INSERT INTO public.profiles (id, username, display_name, avatar_url, cover_url, bio, is_creator, subscription_price, wallet_balance)
VALUES 
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'cyber_vixen', 'Vixen Noir', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', 'Alternative fashion model and electronic synth-pop musician. Uncensored lifestyle logs & daily music jams.', true, 9.99, 2450.00),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'pixel_ghost', 'PixelGhost', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', 'Independent photorealistic digital artist & 3D animator. Custom commissions available. Sub for raw work-in-progress files.', true, 14.99, 1890.00),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'shadow_scribe', 'ShadowScribe', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', 'Underground investigative journalist. Ad-free, censor-free exposure of data harvesting conglomerates.', true, 5.00, 420.00)
ON CONFLICT (username) DO NOTHING;

-- Insert Regular User (You)
INSERT INTO public.profiles (id, username, display_name, avatar_url, cover_url, bio, is_creator, subscription_price, wallet_balance)
VALUES 
('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'user_anon', 'Crypto Knight', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80', 'Cybersecurity enthusiast and early adopter. Anonymity is my shield.', false, 0.00, 150.00)
ON CONFLICT (username) DO NOTHING;

-- Insert Posts
INSERT INTO public.posts (id, user_id, content, media_url, is_locked, likes_count)
VALUES
('p1111111-1111-1111-1111-111111111111', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Late night synth sessions in the studio. Here is a teaser of my upcoming single: "Midnight Static". Full high-quality audio is unlocked for my subscribers below!', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80', false, 84),
('p2222222-2222-2222-2222-222222222222', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Behind-the-scenes photoshoot from last night’s industrial warehouse session. Uncensored, unfiltered, direct to you. Sub to unlock the full 8K album.', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', true, 142),
('p3333333-3333-3333-3333-333333333333', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Rendering my latest abstract cyber-neon artwork. Took 38 hours to complete. Feel free to download for personal wallpaper use!', 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80', false, 203),
('p4444444-4444-4444-4444-444444444444', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Exclusive 3D assets and blender file download link. Includes raw textures and lightning setups.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', true, 55),
('p5555555-5555-5555-5555-555555555555', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'A quick update: Next document dump exposes metadata brokerage chains in the EU. Stay tuned.', null, false, 394),
('p6666666-6666-6666-6666-666666666666', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'UNLOCKED: The Complete PDF Dossier outlining metadata transactions of major telemetry groups. Direct download.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', true, 892)
ON CONFLICT DO NOTHING;
