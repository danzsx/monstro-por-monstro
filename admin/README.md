# Painel editorial

Painel web separado para administrar monstros, aulas e questões do Monstro por Monstro.

## Desenvolvimento local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. A chave deve ser a publishable/anon key; nunca use `service_role` no navegador.

O usuário precisa existir no Supabase Auth e também ter uma linha ativa em `public.admin_profiles`:

```sql
insert into public.admin_profiles (user_id) values ('UUID_DO_USUARIO');
```

## Deploy no Vercel

Crie um projeto separado apontando para o mesmo repositório e use `admin` como **Root Directory**. O `admin/vercel.json` configura o build e a saída `dist`. Cadastre as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` nos ambientes Preview e Production.
