# Edge Functions

Esta pasta fica reservada para funcoes server-side do Supabase, por exemplo:

- webhooks institucionais;
- rotinas de auditoria;
- relatorios agregados;
- integracoes externas autorizadas.

Crie cada funcao em uma subpasta propria:

```text
supabase/functions/nome-da-funcao/index.ts
```

Deploy, depois de logar e linkar o projeto:

```powershell
npx supabase functions deploy nome-da-funcao --project-ref ukjcjzijhakkxnerbvid
```
