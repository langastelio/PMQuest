# Guia — Ligar o PM Quest ao Firebase

> Documento de referência. **Não é preciso** para usar o jogo: o PM Quest já
> funciona com **Supabase** (ver [README](../README.md)). Este guia serve caso um
> dia queiras usar **Firebase** (Authentication + Firestore) em vez do Supabase,
> ou num projeto novo. Mantém-se o mesmo modelo: **uma "linha" de progresso por
> utilizador**, com o objeto `state` do jogo guardado como JSON.

---

## 0. Firebase vs. Supabase — quando escolher

| | **Supabase** (atual) | **Firebase** |
| --- | --- | --- |
| Base de dados | PostgreSQL (SQL) | Firestore (NoSQL, documentos) |
| Regras de segurança | Row Level Security (SQL) | Security Rules (linguagem própria) |
| Chave no browser | `anon`/publishable (pública) | `apiKey` (pública) |
| Plano grátis | 2 projetos, pausa após inatividade | Generoso (Spark), sem pausa |
| SDK no browser | `@supabase/supabase-js` | `firebase/app` + `firebase/auth` + `firebase/firestore` |

Em ambos, a chave que vai para o browser é **pública** — a proteção real vem das
**regras** no servidor. Nunca coloques chaves de administração no cliente.

---

## 1. Criar o projeto Firebase

1. Vai a <https://console.firebase.google.com/> e clica **Adicionar projeto**.
2. Dá-lhe um nome (ex.: `pmquest`), aceita/ignora o Google Analytics, e cria.

## 2. Registar uma app **Web**

1. No painel do projeto, clica no ícone **`</>`** (Web).
2. Dá um apelido (ex.: `PM Quest Web`) e regista. **Não** precisas de Hosting agora.
3. O Firebase mostra o objeto **`firebaseConfig`**. Copia-o — vamos usá-lo já a seguir.

```js
const firebaseConfig = {
  apiKey: "AIza...",                       // pública (protegida pelas Security Rules)
  authDomain: "pmquest.firebaseapp.com",
  projectId: "pmquest",
  storageBucket: "pmquest.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
};
```

## 3. Ativar a autenticação por **Email/Password**

1. Menu lateral → **Build → Authentication → Get started**.
2. Separador **Sign-in method** → **Email/Password** → **Enable** → **Save**.
3. (Opcional, para testar mais rápido) mantém desligado o "Email link (passwordless)".

> Nota: ao contrário do Supabase, o Firebase Email/Password **não exige confirmação
> de email por omissão** — o utilizador entra logo após criar a conta.

## 4. Criar a base de dados **Firestore**

1. Menu lateral → **Build → Firestore Database → Create database**.
2. Escolhe uma localização e começa em **Production mode** (vamos definir regras já a seguir).

### Regras de segurança (essencial)

Separador **Rules** → cola isto → **Publish**. Garante que cada utilizador só lê/escreve
o **seu próprio** documento de progresso:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Modelo de dados: coleção **`progress`**, um documento por utilizador cujo **ID é o
`uid`** do utilizador, com um campo `state` (o objeto do jogo) e `updatedAt`.

---

## 5. Ligar o código do PM Quest ao Firebase

O jogo já expõe uma ponte, `window.PMQuestCloud`, com `getState()`, `replaceState(s)`
e `onSave` (ver [`game.js`](../game.js)). Basta trocar a camada de sincronização.
Cria um ficheiro **`firebase-sync.js`** (equivalente ao atual `supabase-sync.js`):

```html
<!-- no index.html, em vez dos scripts do Supabase: -->
<script type="module" src="firebase-sync.js"></script>
```

```js
// firebase-sync.js  (ES module — usa os SDKs oficiais)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = { /* colar o objeto do passo 2 */ };

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

const bridge = () => window.PMQuestCloud || null;
let pushTimer = null, currentUid = null;

async function fetchRemote(uid) {
  const snap = await getDoc(doc(db, "progress", uid));
  return snap.exists() ? snap.data().state : null;
}
async function pushRemote(uid, state) {
  await setDoc(doc(db, "progress", uid), { state, updatedAt: serverTimestamp() });
}

async function onSignedIn(user) {
  const b = bridge(); if (!b) return;
  const local = b.getState();
  const remote = await fetchRemote(user.uid);
  if (!remote) {
    await pushRemote(user.uid, local);              // primeira vez → adota o local
  } else {
    const ls = (local.xp || 0) + (local.answered || 0);
    const rs = (remote.xp || 0) + (remote.answered || 0);
    if (rs >= ls) b.replaceState(remote);           // fica quem tem mais progresso
    else await pushRemote(user.uid, local);
  }
  b.onSave = (state) => {                            // cada gravação → nuvem (debounced)
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => pushRemote(user.uid, state), 800);
  };
}

onAuthStateChanged(auth, (user) => {
  if (user && user.uid !== currentUid) { currentUid = user.uid; onSignedIn(user); }
  else if (!user) { currentUid = null; const b = bridge(); if (b) b.onSave = null; }
});

// Ações de autenticação (liga aos teus botões):
export const fbSignUp = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
export const fbSignIn = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
export const fbSignOut = () => signOut(auth);
```

> **Rede corporativa:** os SDKs vêm de `www.gstatic.com`. Se a rede bloquear (como
> aconteceu com o CDN jsdelivr), descarrega os ficheiros e serve-os localmente numa
> pasta `vendor/` — tal como já fizemos com o `vendor/supabase.js`.

## 6. Adaptar a página de login

Na [`login.html`](../login.html), troca as chamadas `sb.auth.signInWithPassword` /
`sb.auth.signUp` pelas funções `fbSignIn` / `fbSignUp` acima, e o redireccionamento
para `index.html` mantém-se igual. A sessão do Firebase persiste sozinha, por isso o
jogo reconhece o utilizador ao abrir.

---

## 7. Mapa rápido Supabase → Firebase

| Conceito | Supabase (atual) | Firebase |
| --- | --- | --- |
| Config no cliente | `supabase-config.js` (`url` + `anonKey`) | `firebaseConfig` (`apiKey`, `projectId`, …) |
| Criar conta | `sb.auth.signUp()` | `createUserWithEmailAndPassword()` |
| Entrar | `sb.auth.signInWithPassword()` | `signInWithEmailAndPassword()` |
| Sair | `sb.auth.signOut()` | `signOut()` |
| Estado da sessão | `onAuthStateChange()` | `onAuthStateChanged()` |
| Ler progresso | `from("progress").select()` | `getDoc(doc(db,"progress",uid))` |
| Gravar progresso | `from("progress").upsert()` | `setDoc(doc(db,"progress",uid), …)` |
| Segurança | Row Level Security (SQL) | Security Rules |
| ID do utilizador | `user.id` | `user.uid` |

## 8. Checklist final

- [ ] Projeto Firebase criado e app Web registada
- [ ] Authentication → Email/Password **ativado**
- [ ] Firestore criado com as **Security Rules** acima publicadas
- [ ] `firebaseConfig` colado no `firebase-sync.js`
- [ ] SDKs a carregar (de `gstatic` ou de `vendor/` local)
- [ ] Servir por **HTTP(S)** (a autenticação não funciona em `file://`)

---

### Segurança — o essencial
- A **`apiKey`** do Firebase é **pública** e pode ir para o repositório; ela apenas
  identifica o projeto. Quem protege os dados são as **Security Rules**.
- Nunca ponhas no cliente uma **chave de conta de serviço** (Admin SDK) — essa dá
  acesso total e é só para servidores.
