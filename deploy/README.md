# Publicacao

O projeto ficou dividido assim:

```text
public/     frontend estatico pronto para hospedagem
supabase/   banco, regras SQL, seed e futuras Edge Functions
firebase.*  configuracao antiga preservada para Firebase Hosting/Firestore
```

## Caminho rapido

1. Publique o backend no Supabase:

```powershell
npx supabase login
npx supabase link --project-ref ukjcjzijhakkxnerbvid
npx supabase db push
```

2. Publique o frontend apontando o host para:

```text
public
```

3. Configure variaveis do frontend quando a migracao do Firebase para Supabase
estiver ativa:

```text
SUPABASE_URL=https://ukjcjzijhakkxnerbvid.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_public
```
