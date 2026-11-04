-- ============================================================================
-- NazProject — Seed data (sample catalog in French)
-- Run AFTER 0001 and 0002. Safe to re-run (uses fixed UUIDs + upsert).
-- Note: this seeds CATALOG content only. To make yourself admin, see README.
-- ============================================================================

-- Categories -----------------------------------------------------------------
insert into categories (id, name, slug, description, icon, color, position) values
  ('11111111-1111-1111-1111-111111111111', 'Français',       'francais',
     'Cours de français : grammaire, lecture, expression écrite et orale.', '📚', '#6366f1', 1),
  ('22222222-2222-2222-2222-222222222222', 'Mathématiques',  'mathematiques',
     'Cours de mathématiques : calcul, géométrie, algèbre et logique.', '🔢', '#0ea5e9', 2)
on conflict (id) do update set name = excluded.name, description = excluded.description;

-- Levels ---------------------------------------------------------------------
insert into levels (id, category_id, name, slug, description, position) values
  ('aaaa1111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Primaire', 'primaire', 'Pour les plus jeunes (CP–CM2).', 1),
  ('aaaa1111-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Collège',  'college',  'Niveau collège (6e–3e).', 2),
  ('aaaa1111-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Lycée',    'lycee',    'Niveau lycée (2nde–Terminale).', 3),
  ('bbbb2222-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Primaire', 'primaire', 'Mathématiques pour le primaire.', 1),
  ('bbbb2222-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Collège',  'college',  'Mathématiques niveau collège.', 2),
  ('bbbb2222-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Lycée',    'lycee',    'Mathématiques niveau lycée.', 3)
on conflict (id) do update set name = excluded.name;

-- Courses --------------------------------------------------------------------
insert into courses (id, level_id, title, slug, description, is_premium, price, status, position) values
  ('c0001111-0000-0000-0000-000000000001', 'aaaa1111-0000-0000-0000-000000000001',
     'Les bases de la grammaire', 'bases-grammaire',
     'Découvre les natures de mots, la ponctuation et les phrases simples.', false, 0, 'published', 1),
  ('c0001111-0000-0000-0000-000000000002', 'aaaa1111-0000-0000-0000-000000000002',
     'Conjugaison essentielle', 'conjugaison-essentielle',
     'Maîtrise les temps de base : présent, passé composé, imparfait et futur.', true, 29, 'published', 2),
  ('c0002222-0000-0000-0000-000000000001', 'bbbb2222-0000-0000-0000-000000000001',
     'Additions et soustractions', 'additions-soustractions',
     'Apprends à calculer pas à pas avec des exemples et des exercices.', false, 0, 'published', 1),
  ('c0002222-0000-0000-0000-000000000002', 'bbbb2222-0000-0000-0000-000000000002',
     'Introduction à l''algèbre', 'intro-algebre',
     'Les équations du premier degré expliquées simplement.', true, 39, 'published', 2)
on conflict (id) do update set title = excluded.title, status = excluded.status;

-- Lessons --------------------------------------------------------------------
insert into lessons (id, course_id, title, slug, type, content, is_premium, status, position, duration_min) values
  ('1e550001-0000-0000-0000-000000000001', 'c0001111-0000-0000-0000-000000000001',
     'Qu''est-ce qu''un nom ?', 'quest-ce-quun-nom', 'article',
     '<h2>Le nom</h2><p>Un <strong>nom</strong> sert à désigner une personne, un animal, une chose ou une idée. Par exemple : <em>chat</em>, <em>maison</em>, <em>bonheur</em>.</p><p>On distingue les noms <strong>communs</strong> (chat, table) et les noms <strong>propres</strong> (Paris, Amina).</p>',
     false, 'published', 1, 8),
  ('1e550001-0000-0000-0000-000000000002', 'c0001111-0000-0000-0000-000000000001',
     'Le verbe et son rôle', 'le-verbe', 'article',
     '<h2>Le verbe</h2><p>Le <strong>verbe</strong> exprime une action (courir, manger) ou un état (être, paraître). C''est le cœur de la phrase.</p>',
     false, 'published', 2, 7),
  ('1e550002-0000-0000-0000-000000000001', 'c0002222-0000-0000-0000-000000000001',
     'Additionner deux nombres', 'additionner-deux-nombres', 'article',
     '<h2>L''addition</h2><p>Additionner, c''est <strong>réunir</strong> deux quantités. Exemple : 3 + 4 = 7.</p><p>Astuce : commence par le plus grand nombre et compte en avançant.</p>',
     false, 'published', 1, 6),
  ('1e550002-0000-0000-0000-000000000002', 'c0002222-0000-0000-0000-000000000001',
     'Petit quiz : additions', 'quiz-additions', 'quiz',
     null, false, 'published', 2, 5)
on conflict (id) do update set title = excluded.title;

-- Quiz for the quiz lesson ---------------------------------------------------
insert into quizzes (id, lesson_id, pass_score) values
  ('9a120001-0000-0000-0000-000000000001', '1e550002-0000-0000-0000-000000000002', 60)
on conflict (id) do nothing;

insert into quiz_questions (id, quiz_id, prompt, explanation, position) values
  ('9b120001-0000-0000-0000-000000000001', '9a120001-0000-0000-0000-000000000001', 'Combien font 5 + 3 ?', '5 + 3 = 8', 1),
  ('9b120001-0000-0000-0000-000000000002', '9a120001-0000-0000-0000-000000000001', 'Combien font 7 + 6 ?', '7 + 6 = 13', 2)
on conflict (id) do nothing;

insert into quiz_options (question_id, label, is_correct, position) values
  ('9b120001-0000-0000-0000-000000000001', '7',  false, 1),
  ('9b120001-0000-0000-0000-000000000001', '8',  true,  2),
  ('9b120001-0000-0000-0000-000000000001', '9',  false, 3),
  ('9b120001-0000-0000-0000-000000000002', '12', false, 1),
  ('9b120001-0000-0000-0000-000000000002', '13', true,  2),
  ('9b120001-0000-0000-0000-000000000002', '14', false, 3)
on conflict do nothing;
