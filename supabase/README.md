# Supabase

Estrutura local preparada para o projeto `ukjcjzijhakkxnerbvid`.

```text
supabase/
├── config.toml
├── migrations/
│   └── 20260824130000_initial_rede_protege_schema.sql
├── seed.sql
└── functions/
    └── README.md
```

## Publicar banco no Supabase

```powershell
npx supabase login
npx supabase link --project-ref ukjcjzijhakkxnerbvid
npx supabase db push
```

## Publicar funcoes

```powershell
npx supabase functions deploy nome-da-funcao --project-ref ukjcjzijhakkxnerbvid
```

## Observacao importante

O frontend continua na pasta `public/`. Supabase e o lugar correto para Auth,
Postgres, Storage e Edge Functions. Para publicar o site estatico, use um host
de frontend apontando para `public/`, como Vercel, Netlify ou Firebase Hosting.
Nesse caso, Firebase Hosting seria apenas hospedagem estatica; o backend passa a
ser Supabase.

No frontend, configure a chave publica em `public/js/supabase-config.js` ou, para
teste local sem alterar arquivo versionado, no `localStorage`:

```js
localStorage.setItem('rpm.supabase.publishableKey', 'sua-chave-publica')
```
