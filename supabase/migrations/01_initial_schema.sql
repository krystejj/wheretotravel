CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- Tabela profili użytkowników
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Automatyczne tworzenie profilu po rejestracji nowego użytkownika
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Tabela ulubionych krajów
CREATE TABLE public.favorite_countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    country_code VARCHAR(3) NOT NULL, -- Kod CCA3 (np. POL, ESP, FRA)
    status TEXT CHECK (status IN ('want_to_visit', 'visited')) DEFAULT 'want_to_visit' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (user_id, country_code)
);

ALTER TABLE public.favorite_countries DISABLE ROW LEVEL SECURITY;


-- Tabela notatek
CREATE TABLE public.travel_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    country_code VARCHAR(3) NOT NULL,
    title VARCHAR(120) NOT NULL,
    content TEXT NOT NULL,
    rating SMALLINT CHECK (rating >= 1 AND rating <= 5) DEFAULT 5 NOT NULL,
    visit_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.travel_notes DISABLE ROW LEVEL SECURITY;
