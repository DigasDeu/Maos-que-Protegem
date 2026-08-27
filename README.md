# Rede Protege Maués — Refatoração completa

Esta pasta reaproveita o sistema funcional existente e o reorganiza na arquitetura solicitada, sem manter as superestruturas paralelas do ZIP anterior.

## Estrutura oficial

```text
rede-protege-maues/
├── public/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── protocolos/
│   │   ├── protocolos.html
│   │   ├── novo-protocolo.html
│   │   └── detalhes-protocolo.html
│   ├── encaminhar-conselho.html
│   ├── conselho/
│   │   ├── confirmar-ciencia.html
│   │   ├── registro-sipia.html
│   │   └── acionar-samic.html
│   ├── conselho-tutelar/conselho.html
│   ├── samic/
│   │   ├── samic.html
│   │   ├── confirmar-recebimento.html
│   │   └── tomada-de-decisao.html
│   ├── encaminhamentos/
│   │   ├── encaminhamentos.html
│   │   ├── ubs.html
│   │   ├── creas.html
│   │   ├── dip.html
│   │   ├── ministerio-publico.html
│   │   ├── hospital-savvis.html
│   │   ├── autoridade-policial.html
│   │   ├── devolutiva.html
│   │   └── concluir.html
│   ├── administracao/administracao.html
│   ├── js/
│   │   ├── supabase-config.js
│   │   ├── firebase-config.js          # legado temporario
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── protocolos.js
│   │   ├── fluxo.js
│   │   ├── encaminhamentos.js
│   │   ├── notificacoes.js
│   │   └── administracao.js
│   ├── css/variables.css
│   ├── css/styles.css
│   └── assets/{logos,icons,images}/
├── .firebaserc
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   └── 20260824130000_initial_rede_protege_schema.sql
│   ├── seed.sql
│   └── functions/
├── deploy/README.md
├── netlify.toml
├── vercel.json
├── package.json
├── .gitignore
└── README.md
```

## Estrutura de publicação

- `public/`: frontend estático. Aponte Vercel, Netlify ou qualquer hosting estático para esta pasta.
- `supabase/`: configuração do projeto `ukjcjzijhakkxnerbvid`, migrations SQL, seed e futuras Edge Functions.
- `deploy/README.md`: checklist curto de publicação.

Com Supabase CLI:

```powershell
npx supabase login
npx supabase link --project-ref ukjcjzijhakkxnerbvid
npx supabase db push
```

## O que foi reaproveitado

- identidade visual e shell atual;
- autenticação local/Supabase;
- adaptador Supabase com fallback local;
- dashboard e indicadores;
- protocolos e acompanhamento;
- Conselho Tutelar;
- referências SINAN/SIPIA;
- SAMIC;
- encaminhamentos;
- notificações;
- rede de atendimento;
- usuários, configurações e auditoria;
- estrutura Firebase preservada temporariamente para rollback até validação final do Supabase.

## Separação atual

- `app.js`: inicialização, navegação, shell, componentes compartilhados e ligação entre módulos.
- `auth.js`: autenticação, sessão, primeiro acesso e sincronização de perfis.
- `dashboard.js`: dashboard, indicadores, relatórios e conteúdo de apoio.
- `protocolos.js`: armazenamento, listagem, abertura, detalhes, registros oficiais, timeline, encerramento e reabertura.
- `fluxo.js`: constantes, modelo, estados, transições com `alterarEtapa`, Conselho Tutelar e SAMIC.
- `encaminhamentos.js`: ciclo de encaminhamento, prazos, aceite, devolução, redirecionamento, atendimento, devolutiva e conclusão.
- `notificacoes.js`: central interna, leitura e apresentação dos alertas, sem substituir SINAN/SIPIA.
- `administracao.js`: unidades, usuários, gestão, configurações, auditoria e exportação.
- `supabase-config.js`: ponto único de configuração, inicialização Supabase Auth/Postgres e conversão entre o modelo da interface e as tabelas SQL.
- `firebase-config.js`: legado temporário mantido até o corte final.

## Importante

O sistema foi migrado preservando a lógica existente. O tipo interno legado `notification` ainda é usado pelo modal de abertura rápida para evitar quebrar eventos existentes, porém a interface o apresenta como **Abrir protocolo** e o módulo `notificacoes.js` permanece reservado aos alertas internos.

## Regra de acesso por competência

Notificação não significa autorização de leitura. Perfil não significa acesso total. Cada etapa e cada encaminhamento deve liberar somente o conteúdo necessário para aquele usuário executar sua responsabilidade.

O modelo atual separa o dado operacional do dado protegido:

- `protocolos`/`casos`: protocolo, prioridade, etapa, origem, unidade responsável e dados mínimos.
- `pessoasProtegidas`: identificação e contato, somente por concessão específica.
- `conteudoSensivel`: relato e observações restritas, somente por concessão específica.
- `encaminhamentos`: origem, destino, prazo, status e campos mínimos de atuação.
- `notificacoes`: protocolo, prioridade, prazo e ação necessária, sem nome, endereço, relato ou documento.
- `auditoria`: leituras, alterações e tentativas negadas.

O administrador técnico (`admin`) administra usuários, unidades, regras e configurações, mas não abre automaticamente conteúdo de caso no front-end. A leitura excepcional de caso deve usar `supervisor_caso` ou concessões em `acessosCaso/{caseId}/grants/{uid}`, com justificativa e auditoria.

Antes de utilizar dados reais, valide regras de acesso, governança, LGPD, infraestrutura e autorização institucional conforme o projeto.
