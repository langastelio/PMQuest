/* ===================================================================
   PM Quest — traduções PT das perguntas (AMOSTRA).
   Chave = texto EXATO da pergunta em inglês (de questions.js).
   As opções TÊM de estar na MESMA ordem das inglesas, para o índice da
   resposta continuar válido. Campos: q, options[4], explanation.
   Perguntas sem entrada aqui aparecem em inglês (fallback).
   =================================================================== */
window.QUESTION_BANK_PT = {
  "What does REST stand for in the context of web APIs?": {
    q: "O que significa REST no contexto de APIs web?",
    options: [
      "Transferência de Serviço de Execução Remota",
      "Transferência de Estado Representacional",
      "Tecnologia Fiável de Sincronização de Endpoints",
      "Transporte de Streaming de Eventos em Tempo Real"
    ],
    explanation: "REST significa Representational State Transfer (Transferência de Estado Representacional), um estilo de arquitetura para desenhar APIs em rede com pedidos HTTP sem estado."
  },
  "Which HTTP method is typically used to retrieve data without modifying it?": {
    q: "Que método HTTP é normalmente usado para obter dados sem os modificar?",
    options: ["POST", "DELETE", "GET", "PUT"],
    explanation: "O GET é usado para ler/obter recursos e deve ser seguro e idempotente, não causando alterações no servidor."
  },
  "Which HTTP method is used to create a new resource on the server?": {
    q: "Que método HTTP é usado para criar um novo recurso no servidor?",
    options: ["POST", "GET", "HEAD", "OPTIONS"],
    explanation: "O POST é normalmente usado para criar novos recursos, enviando dados para serem processados pelo servidor."
  },
  "What does the HTTP status code 404 indicate?": {
    q: "O que indica o código de estado HTTP 404?",
    options: ["Erro do servidor", "Recurso não encontrado", "Acesso não autorizado", "Pedido bem-sucedido"],
    explanation: "404 Not Found significa que o recurso pedido não foi encontrado no servidor."
  },
  "What does the HTTP status code 200 mean?": {
    q: "O que significa o código de estado HTTP 200?",
    options: ["Redirecionado", "Pedido inválido", "OK / sucesso", "Proibido"],
    explanation: "200 OK indica que o pedido foi bem-sucedido e o servidor devolveu a resposta esperada."
  },
  "Which HTTP status code range represents client-side errors?": {
    q: "Que gama de códigos de estado HTTP representa erros do lado do cliente?",
    options: ["2xx", "3xx", "4xx", "5xx"],
    explanation: "Os códigos 4xx (como 400, 401, 404) indicam erros causados pelo cliente, como pedidos inválidos ou não autorizados."
  }
};
