# PM Quest 🚀

> Um jogo de treino gamificado para **Product Management** — de Estagiário a Líder de Produto.
> A gamified training game for **Product Management** — from Intern to Product Leader.

PM Quest é uma aplicação **web 100% client-side** (HTML + CSS + JavaScript puro, sem
_frameworks_, sem _build_, sem servidor) que transforma o estudo de _Product Management_
num quiz por rondas com XP, níveis, sequências diárias e conquistas. A interface está em
**Português europeu** e o banco de perguntas tem forte componente de **banca / fintech**.

---

## ✨ Funcionalidades

- **Banco com 1031 perguntas** de escolha múltipla, distribuídas por **191 temas** e
  três níveis de dificuldade (`junior` · `mid` · `senior`).
- **Rondas de 10 perguntas** sem repetições — o progresso é lembrado entre sessões.
- **Sistema de XP e 6 níveis**: Estagiário → Júnior → Associado → Intermédio → Sénior → Líder.
- **Modos de jogo**:
  - **Iniciar Exercício** — ronda normal, com dificuldade ajustada ao teu nível.
  - **Áreas Fracas** — foca os temas onde tens pior precisão.
  - **Filtrar** — escolhe tema e/ou dificuldade (ótimo para preparar uma vaga específica).
  - **Rever Erros** — repete só as perguntas que falhaste, até as dominares.
- **Dois modos de resposta** (nas Definições):
  - **Exame** — só vês as correções no fim da ronda.
  - **Estudo** — vês a resposta e explicação logo após cada pergunta.
- **Temporizador de 30s** por pergunta, com **bónus de XP por rapidez**.
- **Sequências diárias (streaks)** e **12 conquistas** desbloqueáveis.
- **Estatísticas**: precisão, tendência (_sparkline_), melhores temas e temas a melhorar.
- **Explicações** em cada pergunta, com link **"Saber mais"** para fontes externas
  (Scrum Guide, SAFe, NN/g, SVPG, Amplitude, HBR, CFI, etc.).
- **Definições**: modo estudo, temporizador, som (Web Audio), **tema escuro**,
  e **exportar / importar** o progresso em JSON.
- **Acessibilidade / teclado**: teclas `1`–`4` para responder, `Enter` para avançar, `Esc` para fechar modais.
- **Sem dependências e offline-first** — todo o estado é guardado em `localStorage`.

---

## 🏁 Como executar

Como é totalmente estático, basta abrir o ficheiro no browser:

```bash
# Opção 1 — abrir diretamente
# (faz duplo-clique em game.html, ou arrasta-o para o browser)

# Opção 2 — servir localmente (recomendado, evita restrições de ficheiro local)
python -m http.server 8000
# depois abre  http://localhost:8000/game.html
```

Não há passo de _build_ nem instalação de dependências.

---

## 📁 Estrutura do projeto

| Ficheiro        | Descrição                                                                     |
| --------------- | ----------------------------------------------------------------------------- |
| `game.html`     | Estrutura da aplicação — ecrãs (Início, Quiz, Resultados, Estatísticas) e modais. |
| `game.css`      | Estilos, incluindo tema claro/escuro via variáveis CSS.                       |
| `game.js`       | Lógica do jogo: níveis, XP, rondas, temporizador, conquistas, estatísticas, persistência. |
| `questions.js`  | Banco de perguntas — define o global `window.QUESTION_BANK`.                   |

A ordem de carregamento importa: `questions.js` **antes** de `game.js`.

---

## 🧩 Formato das perguntas

Cada pergunta em `questions.js` é um objeto simples:

```js
{
  "q": "What does REST stand for in the context of web APIs?",
  "options": [
    "Remote Execution Service Transfer",
    "Representational State Transfer",
    "Reliable Endpoint Sync Technology",
    "Real-time Event Streaming Transport"
  ],
  "answer": 1,                       // índice (0–3) da opção correta em `options`
  "explanation": "REST stands for Representational State Transfer…",
  "topic": "APIs & REST",            // usado para estatísticas e o link "Saber mais"
  "difficulty": "junior"             // "junior" | "mid" | "senior"
}
```

O motor faz validação, remove duplicados, descodifica entidades HTML (`&amp;`, `&lt;`…) e
**baralha a ordem das opções** em cada carregamento, por isso o índice `answer` só tem
de estar correto relativamente ao array `options` original.

### Adicionar perguntas

Acrescenta objetos a qualquer um dos _arrays_ concatenados dentro de
`window.QUESTION_BANK = [].concat( … )` em `questions.js`. Requisitos por pergunta:

- exatamente **4 opções**;
- `answer` entre **0 e 3**;
- `difficulty` em `junior` / `mid` / `senior` (qualquer outro valor passa a `mid`).

Perguntas com texto duplicado são ignoradas automaticamente.

---

## 🎮 Regras de pontuação

- XP base por acerto: **Fácil 10 · Médio 15 · Difícil 20**.
- **Bónus de rapidez**: até **+10 XP** por resposta rápida (só com temporizador ligado).
- **Ronda perfeita** (10/10): **+20 XP**.
- Subir de nível ou uma ronda perfeita disparam **confetti** e som. 🎉

---

## 💾 Dados e privacidade

Todo o progresso vive **localmente no teu browser** (`localStorage`, chave `pmquest_v2`).
Nada é enviado para servidores. Para levar o progresso para outro dispositivo, usa
**Definições → Progresso → Exportar / Importar**.

---

## 🛠️ Stack

- HTML5, CSS3 (variáveis CSS, _dark mode_), JavaScript ES5/ES6 _vanilla_.
- **Web Audio API** para efeitos sonoros, **Canvas** para o confetti, **SVG** para o _sparkline_.
- Zero dependências externas.

---

## 📄 Licença

Sem licença definida. Adiciona um ficheiro `LICENSE` se pretenderes tornar o uso explícito.
