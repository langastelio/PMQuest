/* ===================================================================
   PM Quest — conteúdo de aprendizagem: Trilhas (com mini-lições) + Glossário.
   Consumido por game.js via window.PMQ_LEARN.
   As trilhas mapeiam-se aos temas das perguntas por palavras-chave (kw),
   pela ORDEM abaixo (o primeiro que corresponde ganha o tema).
   =================================================================== */
window.PMQ_LEARN = {
  paths: [
    {
      id: "fundamentos",
      name: "Fundamentos de Product Management",
      icon: "🌱",
      blurb: "O papel do PM, visão, roadmap e priorização.",
      kw: ["fundament", "roadmap", "priorit", "prioriz", "backlog", "requirement", "mvp", "product owner", "product manager", "product management", "stakeholder", "vision", "value prop", "product-market", "product lifecycle", "product sense", "product strateg", "rice", "kano", "moscow", "value vs effort", "value maximization", "product ops", "trade-off", "scope"],
      lesson:
        "Product Management é a disciplina de descobrir o que construir, para quem e porquê — e garantir que a equipa entrega valor real ao utilizador e ao negócio. O PM vive no cruzamento entre negócio, tecnologia e experiência do utilizador.\n" +
        "O trabalho parte de uma visão e estratégia claras, que se traduzem num roadmap — não uma lista de funcionalidades, mas um plano de resultados (outcomes). Priorizar é a competência central: dizer não a muitas boas ideias para focar nas que geram mais impacto.\n" +
        "Um bom PM não 'manda' na equipa — influencia com contexto, dados e clareza. E mede sucesso por outcomes (mudança de comportamento, métricas), não por output (features entregues)."
    },
    {
      id: "discovery",
      name: "Discovery & Research",
      icon: "🔍",
      blurb: "Validar o problema e a solução antes de construir.",
      kw: ["discovery", "research", "user research", "interview", "jtbd", "jobs to be done", "persona", "usability", "problem", "validation", "validate", "hypothesis", "customer", "survey", "empath", "user need", "user testing", "design thinking", "assumption", "opportunity", "feedback", "prototyp"],
      lesson:
        "Discovery é o processo de reduzir incerteza antes de investir em construir. O objetivo é validar que existe um problema real, que vale a pena resolver, e que a tua solução funciona — idealmente com pouco esforço.\n" +
        "Ferramentas típicas: entrevistas a utilizadores, observação, inquéritos, protótipos e testes de usabilidade. O framework Jobs To Be Done ajuda a focar no 'trabalho' que o utilizador quer ver feito, em vez de na demografia.\n" +
        "A armadilha é apaixonar-se pela solução. Boa discovery separa o problema (bem compreendido) da solução (testada), e trata cada ideia como uma hipótese a validar — não uma verdade."
    },
    {
      id: "metrics",
      name: "Métricas & Dados",
      icon: "📊",
      blurb: "North Star, funis, retenção e experimentação.",
      kw: ["metric", "kpi", "north star", "aarrr", "retention", "funnel", "analytic", "a/b", "ab test", "experiment", "cohort", "ltv", "cac", "nps", "conversion", "engagement", "dau", "mau", "activation", "data", "measure", "statistical", "significance", "unit econ", "heuristic", "sus score"],
      lesson:
        "O que não se mede, não se melhora. As métricas dão à equipa uma bússola partilhada e evitam decisões só por opinião. O truque é escolher poucas métricas certas.\n" +
        "A North Star Metric é a métrica única que melhor representa o valor entregue ao utilizador. À volta dela usam-se frameworks como AARRR (Acquisition, Activation, Retention, Referral, Revenue) para mapear o funil. A retenção costuma ser a métrica mais honesta sobre valor real.\n" +
        "Cuidado com 'vanity metrics' (ex.: total de downloads) que sobem sempre mas não indicam saúde. Prefere métricas acionáveis, comparáveis no tempo, e valida causas com testes A/B e análise de coortes."
    },
    {
      id: "agile",
      name: "Agile, Scrum & Delivery",
      icon: "🔁",
      blurb: "Entregar valor em ciclos curtos e melhorar continuamente.",
      kw: ["scrum", "agile", "sprint", "kanban", "story", "storie", "user stor", "velocity", "safe", "retro", "standup", "stand-up", "daily", "ceremony", "estimation", "story point", "waterfall", "release", "delivery", "iteration", "definition of done", "burndown", "wip", "slicing", "gherkin", "invest", "cards", "pi planning", "po responsibilit", "wsjf", "refinement", "acceptance criteria", "epic"],
      lesson:
        "Agile é uma forma de trabalhar em ciclos curtos, entregando valor de forma incremental e ajustando com base em feedback. Scrum e Kanban são as implementações mais comuns.\n" +
        "Em Scrum, a equipa trabalha em sprints (1-4 semanas), a partir de um backlog priorizado pelo Product Owner. As cerimónias (planeamento, daily, review, retrospetiva) criam ritmo e transparência. Kanban foca-se em fluxo contínuo e em limitar o trabalho em progresso (WIP).\n" +
        "O objetivo não é 'fazer Scrum' — é entregar valor mais depressa e aprender mais cedo. As estimativas servem para planear, não para pressionar. A retrospetiva é onde a equipa melhora continuamente."
    },
    {
      id: "strategy",
      name: "Estratégia & Growth",
      icon: "🎯",
      blurb: "Onde jogar, como ganhar, pricing e crescimento.",
      kw: ["strateg", "growth", "go-to-market", "gtm", "pricing", "price", "monetiz", "monetis", "competit", "market", "positioning", "moat", "business model", "business case", "okr", "expansion", "acquisition channel", "north-star", "vision strateg", "payment", "p&l", "revenue", "differentiat", "unit economic", "roi", "b2b", "b2c", "platform strateg"],
      lesson:
        "Estratégia de produto é a ponte entre a visão e o dia a dia: onde vamos jogar, como vamos ganhar, e o que NÃO vamos fazer. Sem estratégia, o roadmap vira uma lista de pedidos.\n" +
        "Começa pelo mercado e pelo utilizador: qual o problema, qual o segmento, e qual a nossa vantagem (moat). Ferramentas como OKRs alinham a organização em resultados. Pricing e go-to-market determinam como o valor se converte em receita.\n" +
        "Growth é estratégia aplicada à aquisição, ativação e retenção de forma sistemática e mensurável. Boas estratégias são focadas, coerentes e revistas com dados — não planos fixos de cinco anos."
    },
    {
      id: "leadership",
      name: "Liderança & Stakeholders",
      icon: "🤝",
      blurb: "Influenciar sem autoridade, alinhar e comunicar.",
      kw: ["raci", "influence", "authority", "alignment", "align", "meeting", "communicat", "leadership", "negotiat", "conflict", "mentor", "team", "hiring", "career", "collaborat", "presentation", "storytelling", "buy-in", "manage up"],
      lesson:
        "Um PM raramente tem autoridade formal sobre a equipa — o seu poder vem da influência: contexto claro, dados sólidos e confiança ganha ao longo do tempo. Liderar produto é, sobretudo, liderar pessoas sem as 'mandar'.\n" +
        "Alinhar stakeholders exige comunicação adaptada a cada público: para a engenharia, trade-offs e detalhe; para a liderança, resultados e risco; para vendas, valor para o cliente. Ferramentas como a matriz RACI clarificam quem decide, quem executa e quem é consultado.\n" +
        "As competências que mais distinguem PMs seniores são de pessoas: negociar prioridades, gerir conflito, conduzir reuniões eficazes e contar a história certa para gerar 'buy-in'. Comunicar bem multiplica o impacto de tudo o resto."
    },
    {
      id: "tech",
      name: "Tecnologia & APIs",
      icon: "⚙️",
      blurb: "Literacia técnica para decidir bem com a engenharia.",
      kw: ["api", "rest", "http", "sql", "database", "architecture", "technical", "latency", "cache", "cloud", "security", "scalab", "microservice", "data model", "endpoint", "webhook", "encryption", "infrastructure", "ai/ml", "machine learning", "generative ai", "llm", "genai", "artificial intelligence", "json", "caching", "system design", "devops"],
      lesson:
        "Um PM não precisa de programar, mas precisa de literacia técnica para tomar boas decisões e falar de igual para igual com a engenharia. Perceber como os sistemas funcionam evita promessas impossíveis e trade-offs cegos.\n" +
        "Conceitos-chave: APIs e REST (como os sistemas comunicam), HTTP e códigos de estado, bases de dados (SQL vs NoSQL), latência, cache e escalabilidade. Dívida técnica é o custo futuro dos atalhos de hoje — geri-la faz parte do trabalho.\n" +
        "O objetivo é saber fazer as perguntas certas: 'quanto custa?', 'o que quebra em escala?', 'que trade-off estamos a fazer?'. Isso torna-te um parceiro melhor para a equipa técnica."
    }
  ],

  glossary: [
    { t: "MVP (Minimum Viable Product)", d: "A versão mais simples de um produto que permite aprender o máximo sobre os utilizadores com o mínimo de esforço." },
    { t: "MMP (Minimum Marketable Product)", d: "A versão mínima que já entrega valor suficiente para ser lançada e vendida no mercado." },
    { t: "North Star Metric", d: "A métrica única que melhor captura o valor central que o produto entrega ao utilizador; alinha toda a equipa." },
    { t: "OKR", d: "Objectives and Key Results — um objetivo qualitativo e ambicioso, medido por 2-4 resultados-chave quantificáveis." },
    { t: "KPI", d: "Key Performance Indicator — uma métrica que monitoriza o desempenho de uma atividade ao longo do tempo." },
    { t: "JTBD (Jobs To Be Done)", d: "Framework que foca no 'trabalho' que o utilizador contrata o produto para fazer, em vez da demografia." },
    { t: "RICE", d: "Priorização por Reach × Impact × Confidence ÷ Effort, para comparar iniciativas de forma consistente." },
    { t: "WSJF", d: "Weighted Shortest Job First — prioriza pelo valor/urgência a dividir pela duração; usado em SAFe." },
    { t: "MoSCoW", d: "Priorização em Must, Should, Could e Won't have (desta vez)." },
    { t: "Modelo de Kano", d: "Classifica funcionalidades em básicas, de desempenho e de encanto, conforme o efeito na satisfação." },
    { t: "Backlog", d: "Lista priorizada de tudo o que pode ser feito no produto; a fonte de trabalho da equipa." },
    { t: "User Story", d: "Descrição curta de uma necessidade na ótica do utilizador: 'Como <persona>, quero <objetivo> para <benefício>'." },
    { t: "Epic", d: "Um bloco grande de trabalho que se divide em várias user stories." },
    { t: "Sprint", d: "Ciclo de trabalho fixo e curto (1-4 semanas) em Scrum, no fim do qual se entrega incremento potencialmente utilizável." },
    { t: "Scrum", d: "Framework ágil com papéis (PO, Scrum Master, equipa), sprints e cerimónias definidas." },
    { t: "Kanban", d: "Método ágil de fluxo contínuo que visualiza o trabalho e limita o trabalho em progresso (WIP)." },
    { t: "Velocity", d: "Quantidade média de trabalho (ex.: story points) que uma equipa entrega por sprint." },
    { t: "Story Points", d: "Unidade relativa de esforço/complexidade para estimar user stories, em vez de horas." },
    { t: "Definition of Done", d: "Critérios partilhados que uma tarefa tem de cumprir para ser considerada concluída." },
    { t: "Burndown chart", d: "Gráfico que mostra o trabalho restante ao longo de um sprint." },
    { t: "A/B Test", d: "Experiência que compara duas variantes (A e B) para medir qual gera melhor resultado." },
    { t: "Coorte (Cohort)", d: "Grupo de utilizadores que partilham uma característica (ex.: mês de registo), analisado ao longo do tempo." },
    { t: "Retenção", d: "Percentagem de utilizadores que continua a usar o produto após um período; sinal honesto de valor." },
    { t: "Churn", d: "Taxa a que os utilizadores/clientes deixam de usar o produto ou cancelam." },
    { t: "Funil", d: "Sequência de passos que o utilizador percorre (ex.: visita → registo → compra), medindo a conversão em cada um." },
    { t: "AARRR", d: "Framework de métricas 'pirata': Acquisition, Activation, Retention, Referral, Revenue." },
    { t: "LTV", d: "Lifetime Value — receita total esperada de um cliente durante toda a relação com o produto." },
    { t: "CAC", d: "Customer Acquisition Cost — custo médio para adquirir um novo cliente." },
    { t: "NPS", d: "Net Promoter Score — mede a probabilidade de os utilizadores recomendarem o produto (0-10)." },
    { t: "DAU / MAU", d: "Utilizadores ativos diários / mensais; o rácio DAU/MAU indica a frequência de uso ('stickiness')." },
    { t: "Ativação", d: "Momento em que um novo utilizador atinge o primeiro valor real ('aha moment')." },
    { t: "Product-Market Fit", d: "Estado em que o produto satisfia tão bem uma procura forte de mercado que o crescimento se torna natural." },
    { t: "TAM / SAM / SOM", d: "Mercado total, mercado endereçável e mercado que se consegue realmente capturar." },
    { t: "Go-to-Market (GTM)", d: "Plano de como levar um produto ao mercado: público, canais, mensagem e preço." },
    { t: "Roadmap", d: "Plano de alto nível que comunica a direção do produto ao longo do tempo, idealmente por outcomes." },
    { t: "Persona", d: "Representação semi-ficcional de um segmento de utilizadores, baseada em pesquisa." },
    { t: "Wireframe", d: "Esquema de baixa fidelidade da estrutura de um ecrã, sem detalhes visuais." },
    { t: "Protótipo", d: "Versão interativa e descartável de uma solução, usada para testar antes de construir." },
    { t: "Stakeholder", d: "Qualquer pessoa com interesse ou influência no produto (negócio, vendas, jurídico, clientes…)." },
    { t: "Dívida Técnica", d: "Custo futuro de atalhos técnicos tomados hoje para entregar mais depressa." },
    { t: "API / REST", d: "Interface pela qual sistemas comunicam; REST é um estilo comum baseado em HTTP e recursos." },
    { t: "Feature Flag", d: "Mecanismo para ligar/desligar funcionalidades sem novo deploy; útil para lançamentos graduais." },
    { t: "Dogfooding", d: "Usar o próprio produto internamente para o testar e melhorar." },
    { t: "Lean", d: "Abordagem que minimiza desperdício e maximiza aprendizagem via ciclos construir-medir-aprender." }
  ]
};
