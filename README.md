# Chat Público Simples

Aplicação de chat público em Node.js, Express e SQLite. Mensagens expiram automaticamente após 2 horas.

## Pré-requisitos
- Node.js 18+ instalado

## Instalação
```bash
npm install
```

## Executando o servidor
```bash
npm start
```

Acesse em: [http://localhost:3000](http://localhost:3000)

## Estrutura do projeto
- `server.js`: servidor Express e rotas da API.
- `db.js`: conexão com SQLite, criação de tabela e limpeza de mensagens expiradas.
- `public/`: arquivos estáticos (HTML, CSS, JS) do frontend.
