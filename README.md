# Gataria Store v5 — Catálogo + WhatsApp + CMS

Site da Gataria em Next.js preparado para a primeira fase do projeto: apresentar camisetas, organizar coleções e levar o visitante ao atendimento pelo WhatsApp. Carrinho e Mercado Pago ficaram fora da navegação pública e podem ser retomados em uma segunda etapa.

## Executar no computador

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse:

- Site: http://localhost:3000
- Camisetas: http://localhost:3000/produtos
- Coleções: http://localhost:3000/colecoes
- CMS: http://localhost:3000/admin

Em desenvolvimento local, a senha inicial do CMS é `gataria-admin`. Para usar outra, preencha `CMS_PASSWORD` no `.env.local`.

## Configurar o WhatsApp

1. Abra `http://localhost:3000/admin`.
2. Entre em **WhatsApp e contato**.
3. Informe o número com DDD, por exemplo `(51) 99999-9999`.
4. Edite a mensagem automática, se desejar.
5. Clique em **Publicar alterações**.

O botão de cada camiseta abre uma conversa com nome, código, modelo, cor, tamanho e preço já preenchidos.

## O que o CMS controla

- Produtos, preços, estoque, variações e status.
- Galeria de fotos, foto principal, ordem e exclusão.
- Coleções e suas páginas individuais.
- Banner, manifesto e produto em destaque da home.
- Menu, categorias, avaliações, Instagram e rodapé.
- WhatsApp, e-mail e horário de atendimento.
- Páginas institucionais e SEO.
- Backup e restauração do conteúdo em JSON.

## Publicação e banco Neon

Localmente, o CMS grava o conteúdo em `data/site-content.json`. Em produção, configure `DATABASE_URL` com a conexão do Neon. A tabela `gataria_site_content` é criada automaticamente.

Também defina em produção:

```env
CMS_PASSWORD=uma-senha-forte
CMS_SECRET=um-texto-longo-e-aleatorio
```

Sem `DATABASE_URL`, a versão publicada continua exibindo o conteúdo padrão e bloqueia alterações do CMS para evitar a falsa impressão de que os dados foram salvos.

## Compra online

As rotas antigas do Mercado Pago foram mantidas no código como referência, mas não aparecem no catálogo. Quando a Gataria estiver pronta para vender pelo site, a próxima etapa será reativar o carrinho, criar pedidos no banco, calcular frete e conectar o webhook do Mercado Pago.
