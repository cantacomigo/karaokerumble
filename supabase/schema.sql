-- 1. Create a table for public profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  view_count INTEGER DEFAULT 0
);

-- 2. Create or Update the videos table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    "embedCode" TEXT NOT NULL,
    thumbnail TEXT,
    duration TEXT DEFAULT '00:00',
    views TEXT DEFAULT '0',
    views_count INTEGER DEFAULT 0,
    likes TEXT DEFAULT '0',
    date TEXT,
    author TEXT DEFAULT 'Cante Comigo',
    "authorAvatar" TEXT DEFAULT '/logo.png',
    subscribers TEXT DEFAULT '6',
    category TEXT DEFAULT 'Sertanejo',
    mp3_url TEXT,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft'))
);

-- Function to increment video views atomically
CREATE OR REPLACE FUNCTION increment_video_views(video_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.videos
  SET views_count = views_count + 1,
      views = (COALESCE(NULLIF(views, '')::integer, 0) + 1)::text
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure missing columns exist if the table was created previously
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'videos' AND COLUMN_NAME = 'user_id') THEN
        ALTER TABLE public.videos ADD COLUMN user_id UUID REFERENCES auth.users DEFAULT auth.uid();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'videos' AND COLUMN_NAME = 'status') THEN
        ALTER TABLE public.videos ADD COLUMN status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'plan') THEN
        ALTER TABLE public.profiles ADD COLUMN plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'plan_expires_at') THEN
        ALTER TABLE public.profiles ADD COLUMN plan_expires_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'view_count') THEN
        ALTER TABLE public.profiles ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'videos' AND COLUMN_NAME = 'mp3_url') THEN
        ALTER TABLE public.videos ADD COLUMN mp3_url TEXT;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 4. Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profiles." ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profiles." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 5. Videos Policies (Refined for ownership)
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.videos;
DROP POLICY IF EXISTS "Enable read for anonymous users" ON public.videos;
DROP POLICY IF EXISTS "Users can view all published videos." ON public.videos;
DROP POLICY IF EXISTS "Users can insert their own videos." ON public.videos;
DROP POLICY IF EXISTS "Users can update their own videos." ON public.videos;
DROP POLICY IF EXISTS "Users can delete their own videos." ON public.videos;

CREATE POLICY "Users can view all published videos." ON public.videos
  FOR SELECT USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos." ON public.videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos." ON public.videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos." ON public.videos
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, plan, view_count)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    new.email,
    'free',
    0
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
