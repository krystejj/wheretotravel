DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;

    IF test_user_id IS NOT NULL THEN
        INSERT INTO public.favorite_countries (user_id, country_code, status)
        VALUES
            (test_user_id, 'ITA', 'visited'),
            (test_user_id, 'JPN', 'want_to_visit'),
            (test_user_id, 'ISL', 'want_to_visit')
        ON CONFLICT (user_id, country_code) DO NOTHING;

        INSERT INTO public.travel_notes (user_id, country_code, title, content, rating, visit_date)
        VALUES
            (test_user_id, 'ITA', 'wyprawa do Rzymu', 'widziałem koloseum i jadłem zajebistą pizzę', 5, '2023-05-15'),
            (test_user_id, 'JPN', 'Plan zwiedzania Tokio', 'przejść przez każdy bar w mieście :)))', 5, '2025-10-10');
    END IF;
END $$;
