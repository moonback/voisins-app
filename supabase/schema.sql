-- ==========================================
-- SUPABASE SCHEMA - VOISINS APP
-- ==========================================

-- Enable PostGIS for distance calculations (if available, otherwise use basic math/haversine)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Profiles Table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT CHECK (role IN ('client', 'provider', 'both')) DEFAULT 'client',
    rating DECIMAL(3,2) DEFAULT 0.0,
    reviews_count INT DEFAULT 0,
    missions_completed INT DEFAULT 0,
    skills TEXT[],
    latitude DECIMAL,
    longitude DECIMAL,
    address TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Missions Table
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES profiles(id) NOT NULL,
    provider_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT CHECK (status IN ('draft', 'open', 'assigned', 'completed', 'cancelled')) DEFAULT 'open',
    budget DECIMAL NOT NULL,
    is_urgent BOOLEAN DEFAULT false,
    latitude DECIMAL,
    longitude DECIMAL,
    address TEXT,
    mission_date TIMESTAMPTZ,
    images TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Mission Offers (proposals from providers)
CREATE TABLE mission_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    proposed_price DECIMAL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Conversations & Messages Chat
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    participant1_id UUID REFERENCES profiles(id),
    participant2_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    content TEXT,
    image_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES missions(id),
    reviewer_id UUID REFERENCES profiles(id),
    reviewee_id UUID REFERENCES profiles(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    body TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, self write
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Missions: Public read (open status), participants read all, self write
CREATE POLICY "Open missions are viewable by everyone" ON missions FOR SELECT USING (status = 'open' OR auth.uid() = client_id OR auth.uid() = provider_id);
CREATE POLICY "Clients can create missions" ON missions FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Participants can update missions" ON missions FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- Messages: Only participants can read/write
CREATE POLICY "Participants can read messages" ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid()))
);
CREATE POLICY "Participants can send messages" ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid()))
);
