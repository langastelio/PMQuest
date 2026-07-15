/* ===================================================================
   PM Quest — i18n (PT / EN) for the STATIC interface.
   Elements with data-i18n="key" get their text replaced; elements with
   data-i18n-html="key" get their innerHTML replaced. Switching language
   reloads the page so everything re-renders cleanly.
   =================================================================== */
(function () {
  "use strict";

  var DICT = {
    pt: {
      appbar_sub: "Product Management · Júnior → Sénior",
      // home
      home_currentLevel: "Nível actual",
      st_answered: "Respondidas",
      st_accuracy: "Precisão",
      st_rounds: "Rondas",
      st_remaining: "Por responder",
      home_byTopic: "Desempenho por tema",
      btn_weak: '<span class="em">🎯</span> Áreas Fracas',
      btn_filter: '<span class="em">🎛️</span> Filtrar',
      btn_review: '<span class="em">🔍</span> Rever Erros',
      lead_link: "🏆 Leaderboard →",
      stats_link: "📊 Estatísticas & conquistas →",
      // quiz
      q_time: "⏱️ Tempo",
      q_quit: "✕ Sair",
      // results
      res_home: "🏠 Início",
      // stats screen
      stats_title: "Estatísticas & Conquistas",
      kpi_xp: "XP total",
      kpi_acc: "Precisão",
      kpi_rounds: "Rondas",
      kpi_streak: "Sequência",
      kpi_best: "Melhor sequência",
      kpi_avg: "XP média/ronda",
      stats_trend: "Tendência de precisão (últimas rondas)",
      stats_best: "Melhores temas",
      stats_weak: "Temas a melhorar",
      stats_ach: "Conquistas",
      // leaderboard
      lead_title: "🏆 Leaderboard",
      lead_sub: "Melhores jogadores por XP.",
      // filter modal
      f_title: "🎛️ Filtrar exercício",
      f_sub: "Prepara-te para uma vaga específica escolhendo o tema e a dificuldade.",
      f_topic: "Tema",
      f_allTopics: "Todos os temas",
      f_difficulty: "Dificuldade",
      f_all: "Todas",
      f_easy: "Fácil",
      f_medium: "Médio",
      f_hard: "Difícil",
      f_cancel: "Cancelar",
      f_start: "Começar →",
      // settings modal
      set_title: "⚙️ Definições",
      set_sub: "Personaliza a tua experiência de jogo.",
      set_study: "Modo de estudo",
      set_study_s: "Mostra a resposta e explicação logo após cada questão (em vez de só no fim)",
      set_timer: "Temporizador",
      set_timer_s: "Conta-decrescente de 30s por questão, com bónus de rapidez",
      set_sound: "Som",
      set_sound_s: "Efeitos sonoros de acerto, erro e subida de nível",
      set_dark: "Tema escuro",
      set_dark_s: "Alterna entre claro e escuro",
      set_progress: "Progresso",
      set_progress_s: "Guarda o teu progresso num ficheiro",
      set_export: "⬇ Exportar",
      set_session: "Sessão",
      set_session_s: "Termina a sessão sem apagar o progresso guardado neste dispositivo.",
      set_logout: "↪ Terminar sessão",
      set_reset: "↺ Recomeçar do zero",
      set_close: "Fechar",
    },
    en: {
      appbar_sub: "Product Management · Junior → Senior",
      home_currentLevel: "Current level",
      st_answered: "Answered",
      st_accuracy: "Accuracy",
      st_rounds: "Rounds",
      st_remaining: "Remaining",
      home_byTopic: "Performance by topic",
      btn_weak: '<span class="em">🎯</span> Weak Areas',
      btn_filter: '<span class="em">🎛️</span> Filter',
      btn_review: '<span class="em">🔍</span> Review Mistakes',
      lead_link: "🏆 Leaderboard →",
      stats_link: "📊 Stats & achievements →",
      q_time: "⏱️ Time",
      q_quit: "✕ Quit",
      res_home: "🏠 Home",
      stats_title: "Stats & Achievements",
      kpi_xp: "Total XP",
      kpi_acc: "Accuracy",
      kpi_rounds: "Rounds",
      kpi_streak: "Streak",
      kpi_best: "Best streak",
      kpi_avg: "Avg XP/round",
      stats_trend: "Accuracy trend (recent rounds)",
      stats_best: "Best topics",
      stats_weak: "Topics to improve",
      stats_ach: "Achievements",
      lead_title: "🏆 Leaderboard",
      lead_sub: "Top players by XP.",
      f_title: "🎛️ Filter exercise",
      f_sub: "Prepare for a specific role by choosing the topic and difficulty.",
      f_topic: "Topic",
      f_allTopics: "All topics",
      f_difficulty: "Difficulty",
      f_all: "All",
      f_easy: "Easy",
      f_medium: "Medium",
      f_hard: "Hard",
      f_cancel: "Cancel",
      f_start: "Start →",
      set_title: "⚙️ Settings",
      set_sub: "Customise your game experience.",
      set_study: "Study mode",
      set_study_s: "Shows the answer and explanation right after each question (instead of only at the end)",
      set_timer: "Timer",
      set_timer_s: "30s countdown per question, with a speed bonus",
      set_sound: "Sound",
      set_sound_s: "Sound effects for correct, wrong and level-up",
      set_dark: "Dark theme",
      set_dark_s: "Switch between light and dark",
      set_progress: "Progress",
      set_progress_s: "Save your progress to a file",
      set_export: "⬇ Export",
      set_session: "Session",
      set_session_s: "Sign out without deleting the progress saved on this device.",
      set_logout: "↪ Sign out",
      set_reset: "↺ Reset everything",
      set_close: "Close",
    },
  };

  function getLang() {
    try { var l = localStorage.getItem("pmquest_lang"); if (l === "pt" || l === "en") return l; } catch (e) {}
    return "pt";
  }
  function setLang(l) { try { localStorage.setItem("pmquest_lang", l); } catch (e) {} }
  function t(key) { var l = getLang(); return (DICT[l] && DICT[l][key]) || DICT.pt[key] || key; }

  function apply() {
    var lang = getLang();
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n")); if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-html")); if (v != null) el.innerHTML = v;
    });
    var btn = document.getElementById("langBtn");
    if (btn) btn.textContent = lang.toUpperCase();
  }
  function toggle() { setLang(getLang() === "pt" ? "en" : "pt"); location.reload(); }

  window.PMQ_I18N = { t: t, apply: apply, toggle: toggle, getLang: getLang };

  function boot() {
    apply();
    var btn = document.getElementById("langBtn");
    if (btn) btn.onclick = toggle;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
