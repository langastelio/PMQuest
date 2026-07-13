/* ===================================================================
   PM Quest — configuração partilhada do Supabase
   Usada por login.html e por supabase-sync.js.
   A chave "publishable"/"anon" é PÚBLICA por natureza — pode ir para o
   repositório. A proteção real vem das políticas Row Level Security.
   NUNCA colocar aqui a chave "secret" nem a password da base de dados.
   =================================================================== */
window.PMQUEST_SUPABASE = {
  url: "https://inijdjbclaiujgcuwhvb.supabase.co",
  anonKey: "sb_publishable_FnsWCp4k_nnL2msrdwT8pg_kXfmYcve",
};
