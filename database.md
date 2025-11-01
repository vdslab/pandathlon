# Tables

```sql
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.answer_details (
  answer_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  quiz_element_id bigint NOT NULL,
  answer bigint NOT NULL,
  CONSTRAINT answer_details_pkey PRIMARY KEY (answer_id, quiz_element_id),
  CONSTRAINT answer_details_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.answers(id),
  CONSTRAINT answer_details_quiz_element_id_fkey FOREIGN KEY (quiz_element_id) REFERENCES public.quiz_elements(id)
);
CREATE TABLE public.answers (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  quiz_id bigint NOT NULL,
  CONSTRAINT answers_pkey PRIMARY KEY (id),
  CONSTRAINT answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT answers_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
);
CREATE TABLE public.bookmarks (
  quiz_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  CONSTRAINT bookmarks_pkey PRIMARY KEY (quiz_id, user_id),
  CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT bookmarks_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
);
CREATE TABLE public.creators (
  id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL DEFAULT ''::text,
  CONSTRAINT creators_pkey PRIMARY KEY (id),
  CONSTRAINT creators_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT creators_id_fkey1 FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.quiz_element_score (
  quiz_element_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  quiz_result_id bigint NOT NULL,
  score bigint NOT NULL,
  CONSTRAINT quiz_element_score_pkey PRIMARY KEY (quiz_element_id, quiz_result_id),
  CONSTRAINT quiz_element_score_quiz_element_id_fkey FOREIGN KEY (quiz_element_id) REFERENCES public.quiz_elements(id),
  CONSTRAINT quiz_element_score_quiz_result_id_fkey FOREIGN KEY (quiz_result_id) REFERENCES public.quiz_results(id)
);
CREATE TABLE public.quiz_elements (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  quiz_id bigint NOT NULL,
  content text NOT NULL,
  CONSTRAINT quiz_elements_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_elements_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
);
CREATE TABLE public.quiz_results (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  quiz_id bigint NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  CONSTRAINT quiz_results_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_results_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
);
CREATE TABLE public.quizzes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  published boolean NOT NULL DEFAULT false,
  creator_id uuid NOT NULL,
  CONSTRAINT quizzes_pkey PRIMARY KEY (id),
  CONSTRAINT personality_quizzes_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creators(id)
);
```
