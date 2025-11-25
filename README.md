# Bate-papo público por 1 hora

Site estático pronto para o GitHub Pages que cria um bate-papo público usando [Gun.js](https://gun.eco/) (rede p2p). As mensagens ficam visíveis para todos que abrirem o site e expiram automaticamente após **1 hora**.

## Como publicar no GitHub Pages
1. Ative o GitHub Pages em **Settings → Pages**, selecionando a branch `main`.
2. Faça commit e push deste repositório.
3. Aguarde a publicação automática e compartilhe a URL pública.

## Como usar
- Digite o nome que deseja exibir (opcionalmente marque "lembrar meu nome").
- Escreva a mensagem e envie: ela aparece para todas as pessoas conectadas e expira em 1h.
- Tudo roda direto no navegador, sem backend próprio (usa peers públicos do Gun).

## Desenvolvimento local
Abra o arquivo `index.html` no navegador ou sirva com qualquer servidor estático. Não é necessário instalar dependências.
