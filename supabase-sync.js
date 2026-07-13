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

    // ---- profiles / leaderboard ----
    var identity = { uid: null, name: null, anonymous: false, is_admin: false };

    function pendingName() {
      try { return (localStorage.getItem("pmquest_pending_name") || localStorage.getItem("pmquest_name") || "").trim(); }
      catch (e) { return ""; }
    }
    function storeName(n) { try { localStorage.setItem("pmquest_name", n); localStorage.removeItem("pmquest_pending_name"); } catch (e) {} }

    // Make sure a public profile row (display name for the leaderboard) exists.
    function ensureProfile(user, state) {
      return sb.from("profiles").select("name").eq("id", user.id).maybeSingle().then(function (res) {
        if (res.data && res.data.name) { identity.name = res.data.name; return; }
        var name = pendingName() || (user.email ? user.email.split("@")[0] : "") ||
                   ("Jogador" + Math.floor(Math.random() * 9000 + 1000));
        return insertProfile(user.id, name, state, 0);
      });
    }
    function insertProfile(uid, name, state, attempt) {
      return sb.from("profiles").insert({
        id: uid, name: name, xp: (state && state.xp) || 0, answered: (state && state.answered) || 0
      }).then(function (res) {
        if (!res.error) { identity.name = name; storeName(name); return; }
        // Name already taken (unique index): append a number and retry a few times.
        if (/duplicate|unique/i.test(res.error.message) && attempt < 3) {
          return insertProfile(uid, name.replace(/\d+$/, "") + Math.floor(Math.random() * 900 + 100), state, attempt + 1);
        }
        console.warn("[sync] profile:", res.error.message);
      });
    }
    function updateProfileStats(uid, state) {
      return sb.from("profiles").update({ xp: state.xp || 0, answered: state.answered || 0 }).eq("id", uid);
    }
    function fetchLeaderboard() {
      return sb.from("profiles").select("id,name,xp").order("xp", { ascending: false })
        .order("answered", { ascending: false }).limit(50)
        .then(function (res) {
          if (res.error) { console.warn("[sync] leaderboard:", res.error.message); return []; }
          return res.data || [];
        });
    }

    // Expose leaderboard/identity/sign-out to game.js right away (before sign-in).
    var b0 = bridge();
    if (b0) {
      b0.fetchLeaderboard = fetchLeaderboard;
      b0.getIdentity = function () { return identity; };
      b0.adminResetAllXp = function () {
        return sb.rpc("admin_reset_all_xp").then(function (res) {
          if (res.error) { console.warn("[admin] reset:", res.error.message); return false; }
          return true;
        });
      };
      b0.adminDeleteUser = function (uid) {
        return sb.rpc("admin_delete_user", { target: uid }).then(function (res) {
          if (res.error) { console.warn("[admin] delete:", res.error.message); return false; }
          return true;
        });
      };
      b0.adminResetUserXp = function (uid) {
        return sb.rpc("admin_reset_user_xp", { target: uid }).then(function (res) {
          if (res.error) { console.warn("[admin] reset user:", res.error.message); return false; }
          return true;
        });
      };
      b0.signOut = function () {
        try { localStorage.removeItem("pmquest_guest"); localStorage.removeItem("pmquest_name"); localStorage.removeItem("pmquest_pending_name"); } catch (e) {}
        sb.auth.signOut().then(function () { location.replace("login.html"); }, function () { location.replace("login.html"); });
      };
    }

    // ---- reconcile local vs remote on sign-in ----
    function onSignedIn(session) {
      var b = bridge(); if (!b) return;
      var user = session.user;
      identity.uid = user.id;
      identity.anonymous = !user.email;
      if ($("acctSignedOut")) $("acctSignedOut").style.display = "none";
      if ($("acctSignedIn")) $("acctSignedIn").style.display = "flex";
      if ($("acctWho")) $("acctWho").textContent = user.email || pendingName() || "convidado";
      setMsg("");
      setSync("a sincronizar…");

      // Detect an account switch in THIS browser. The local progress belongs to
      // whoever was signed in before; a different user must never inherit it.
      var lastUid = null;
      try { lastUid = localStorage.getItem("pmquest_uid"); } catch (e) {}
      var switched = lastUid && lastUid !== user.id;
      try { localStorage.setItem("pmquest_uid", user.id); } catch (e) {}

      var local = b.getState();
      fetchRemote(user.id).then(function (remote) {
        if (switched) {
          // Different account: discard the previous user's local data entirely.
          if (remote) { b.replaceState(remote); setSync("✔ sincronizado"); return null; }
          b.resetLocal(); setSync("✔ sincronizado");
          return pushRemote(user.id, b.getState());
        }
        if (!remote) {
          // First time on this account -> adopt the current local progress.
          return pushRemote(user.id, local);
        }
        // Same user: keep whichever side has more progress (offline play safe).
        var localScore = (local.xp || 0) + (local.answered || 0);
        var remoteScore = (remote.xp || 0) + (remote.answered || 0);
        if (remoteScore >= localScore) { b.replaceState(remote); setSync("✔ sincronizado"); }
        else return pushRemote(user.id, local);
      }).then(function () {
        return ensureProfile(user, b.getState());     // leaderboard display name
      }).then(function () {
        // Ask the server whether THIS user is an admin (nobody can see others').
        return sb.rpc("is_admin").then(function (res) { identity.is_admin = (!res.error && res.data === true); });
      }).then(function () {
        return updateProfileStats(user.id, b.getState());
      }).then(function () {
        if ($("acctWho")) $("acctWho").textContent = user.email || identity.name || "convidado";
        // From now on, each local save pushes progress + leaderboard score (debounced).
        b.onSave = function (state) {
          clearTimeout(pushTimer);
          setSync("a guardar…");
          pushTimer = setTimeout(function () {
            pushRemote(user.id, state).then(function () { return updateProfileStats(user.id, state); });
          }, 800);
        };
      });
    }

    function onSignedOut() {
      var b = bridge(); if (b) b.onSave = null;
      identity.uid = null; identity.name = null; identity.anonymous = false; identity.is_admin = false;
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
