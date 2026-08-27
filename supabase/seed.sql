insert into public.usuarios (
  id,
  email,
  name,
  role,
  unit_id,
  active,
  liberation,
  requested_unit,
  provider,
  email_verified,
  payload
)
values (
  'diego-admin',
  'diegofernandosilva.10@gmail.com',
  'Diego Fernando Pereira da Silva',
  'admin',
  'rede',
  true,
  'liberado',
  'Administracao',
  'bootstrap',
  true,
  '{
    "id": "diego-admin",
    "email": "diegofernandosilva.10@gmail.com",
    "name": "Diego Fernando Pereira da Silva",
    "role": "admin",
    "unitId": "rede",
    "active": true,
    "liberation": "liberado",
    "requestedUnit": "Administracao",
    "provider": "bootstrap",
    "emailVerified": true
  }'::jsonb
)
on conflict (email) do nothing;
