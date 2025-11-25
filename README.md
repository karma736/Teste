# Site público com banco de dados no navegador

Crie e publique um site estático no GitHub Pages com um banco de dados funcional usando **IndexedDB**. Tudo roda no navegador: você pode adicionar, fixar, remover e exportar registros sem precisar de servidor.

## Como usar

1. Abra `index.html` em um servidor local (por exemplo, `python -m http.server 4000`) ou acesse a versão publicada no GitHub Pages.
2. Preencha o formulário, marque "Fixar no topo" se quiser priorizar, e clique em **Salvar registro**.
3. Use **Exportar JSON** para baixar todos os registros ou **Limpar banco** para zerar o IndexedDB.

## Publicando no GitHub Pages

1. Faça commit e push deste código para a branch `main` do seu repositório.
2. Nas configurações do repositório, acesse **Settings → Pages** e escolha "Deploy from a branch" apontando para `main` e a pasta raiz (`/`).
3. Aguarde o deploy automático do GitHub Pages e acesse a URL exibida em **Visit site**.

## Estrutura

- `index.html`: marcação principal do site e chamada para os assets.
- `assets/styles.css`: estilos e layout escuro responsivo.
- `assets/app.js`: lógica de CRUD, exportação e limpeza do banco no IndexedDB.

## Licença

MIT
