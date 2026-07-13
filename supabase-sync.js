/* ===================================================================
   PM Quest — Supabase auth + progress sync (OPTIONAL layer)
   -------------------------------------------------------------------
   The game works 100% offline without this file. When configured and
   the player signs in (email + password), their `state` object syncs
   to the cloud with a simple "most-progress-wins" reconcile, then every
   later save is pushed automatically (debounced).

   Talks to game.js only through window.PMQuestCloud (defined there).
   =================================================================== */
(function () {
  "use strict";

  // Config comes from supabase-config.js (window.PMQUEST_SUPABASE), which is
  // shared with login.html. Fallbacks below keep this file usable on its own.
  var CFG = window.PMQUEST_SUPABASE || {};
  var SUPABASE_URL = CFG.url || "https://inijdjbclaiujgcuwhvb.supabase.co";
  var SUPABASE_ANON_KEY = CFG.anonKey || "PASTE_YOUR_PUBLISHABLE_KEY_HERE";

  var $ = function (id) { return document.getElementById(id); };

  var configured =
    /^https:\/\/.+\.supabase\.co$/.test(SUPABASE_URL) &&
    SUPABASE_ANON_KEY &&
    SUPABASE_ANON_KEY !== "PASTE_YOUR_PUBLISHABLE_KEY_HERE";

  // If not configured or the CDN library failed to load (e.g. offline),
  // hide the account UI and leave the app exactly as it was.
  function hideAccountUI() { var r = $("acctRow"); if (r) r.style.display = "none"; }

  function boot() {
    if (!configured || !window.supabase) { hideAccountUI(); return; }

    var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    var pushTimer = null;
    var currentUserId = null;

    var bridge = function () { return window.PMQuestCloud || null; };
    function setSync(t) { var el = $("acctSyncState"); if (el) el.textContent = t; }
    function setMsg(t, ok) {
      var el = $("acctMsg"); if (!el) return;
      el.textContent = t || "";
      el.className = "acct-msg" + (ok ? " ok" : (t ? " bad" : ""));
    }
    function translate(m) {
      if (/Invalid login/i.test(m)) return "Credenciais inválidas.";
      if (/already registered|already been registered/i.test(m)) return "Este email já tem conta. Tenta Entrar.";
      if (/Email not confirmed/i.test(m)) return "Confirma o email antes de entrar.";
      if (/at least 6/i.test(m)) return "Palavra-passe mínima de 6 caracteres.";
      if (/rate limit|too many/i.test(m)) return "Demasiadas tentativas. Aguarda um pouco.";
      return m;
    }

    // ---- remote I/O ----
    function fetchRemote(userId) {
      return sb.from("progress").select("state").eq("user_id", userId).maybeSingle()
        .then(function (res) {
          if (res.error) { console.warn("[sync] fetch:", res.error.message); return null; }
          return res.data ? res.data.state : null;
        });
    }
    function pushRemote(userId, state) {
      return sb.from("progress").upsert({ user_id: userId, state: state })
        .then(function (res) {
          if (res.error) { console.warn("[sync] push:", res.error.message); setSync("⚠ erro ao sincronizar"); }
          else setSync("✔ sincronizado");
        });
    }

    // ---- reconcile local vs remote on sign-in ----
    function onSignedIn(session) {
      var b = bridge(); if (!b) return;
      var user = session.user;
      if ($("acctSignedOut")) $("acctSignedOut").style.display = "none";
      if ($("acctSignedIn")) $("acctSignedIn").style.display = "flex";
      if ($("acctWho")) $("acctWho").textContent = user.email;
      setMsg("");
      setSync("a sincronizar…");

      var local = b.getState();
      fetchRemote(user.id).then(function (remote) {
        if (!remote) {
          // First time on this account -> adopt the current local progress.
          return pushRemote(user.id, local);
        }
        // Keep whichever side shows more progress, so offline play is never lost.
        var localScore = (local.xp || 0) + (local.answered || 0);
        var remoteScore = (remote.xp || 0) + (remote.answered || 0);
        if (remoteScore >= localScore) { b.replaceState(remote); setSync("✔ sincronizado"); }
        else return pushRemote(user.id, local);
      }).then(function () {
        // From now on, each local save pushes to the cloud (debounced).
        b.onSave = function (state) {
          clearTimeout(pushTimer);
          setSync("a guardar…");
          pushTimer = setTimeout(function () { pushRemote(user.id, state); }, 800);
        };
      });
    }

    function onSignedOut() {
      var b = bridge(); if (b) b.onSave = null;
      if ($("acctSignedIn")) $("acctSignedIn").style.display = "none";
      if ($("acctSignedOut")) $("acctSignedOut").style.display = "flex";
      setSync(""); setMsg("");
    }

    // ---- auth actions ----
    function signIn() {
      var email = ($("acctEmail").value || "").trim(), password = $("acctPass").value || "";
      if (!email || !password) { setMsg("Preenche o email e a palavra-passe."); return; }
      setMsg("A entrar…");
      sb.auth.signInWithPassword({ email: email, password: password })
        .then(function (res) { if (res.error) setMsg(translate(res.error.message)); else setMsg(""); });
    }
    function signUp() {
      var email = ($("acctEmail").value || "").trim(), password = $("acctPass").value || "";
      if (!email || password.length < 6) { setMsg("Palavra-passe mínima de 6 caracteres."); return; }
      setMsg("A criar conta…");
      sb.auth.signUp({ email: email, password: password })
        .then(function (res) {
          if (res.error) setMsg(translate(res.error.message));
          else if (res.data.session) setMsg("Conta criada com sucesso!", true);
          else setMsg("Conta criada — confirma o email e depois Entra.", true);
        });
    }
    function signOut() { sb.auth.signOut(); }

    // ---- wire up ----
    if ($("acctSignIn")) $("acctSignIn").onclick = signIn;
    if ($("acctSignUp")) $("acctSignUp").onclick = signUp;
    if ($("acctSignOut")) $("acctSignOut").onclick = signOut;
    // Enter key in the password field submits sign-in.
    if ($("acctPass")) $("acctPass").addEventListener("keydown", function (e) { if (e.key === "Enter") signIn(); });

    // React to auth state. supabase-js emits INITIAL_SESSION on load, so this
    // also restores an existing session. Reconcile only once per user.
    sb.auth.onAuthStateChange(function (_event, session) {
      if (session && session.user) {
        if (session.user.id !== currentUserId) { currentUserId = session.user.id; onSignedIn(session); }
      } else {
        currentUserId = null; onSignedOut();
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
