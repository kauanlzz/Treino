# Gerenciador Semanal de Treinos

## Objetivo

Aplicação web simples para organizar uma rotina recorrente de exercícios de segunda a domingo, acompanhar treinos concluídos e manter os dados salvos no navegador.

## Escopo inicial

- Exibir os sete dias da semana em uma visão responsiva.
- Permitir vários treinos por dia, com nome.
- Permitir marcar e desmarcar cada treino como concluído.
- Permitir remover treinos.
- Persistir treinos e conclusões no `localStorage`.
- Não exigir conta, servidor, instalação ou conexão com backend.

## Decisões

- A semana é um modelo recorrente, não um calendário com datas específicas.
- Os dias começam na segunda-feira.
- Cada treino fica concluído até ser desmarcado manualmente; não há reinicialização semanal automática.
- O arquivo Python previamente presente no workspace fica fora do escopo da aplicação web.

## Etapas

1. [x] Registrar escopo e decisões do MVP.
2. [x] Criar a estrutura semântica da página em `index.html`.
3. [x] Implementar inclusão, remoção, conclusão e persistência em `script.js`.
4. [x] Criar uma interface responsiva e acessível em `styles.css`.
5. [x] Validar os fluxos no navegador e em tela estreita.

## Estrutura

- `index.html` — estrutura e pontos de entrada da aplicação.
- `styles.css` — layout, componentes e adaptação para telas menores.
- `script.js` — estado semanal, interações e armazenamento local.
- `PLANO.md` — escopo, decisões e evolução do projeto.

## Critérios de validação

- Os sete dias aparecem, inclusive quando não têm treinos.
- É possível adicionar vários treinos em qualquer dia; nomes vazios são recusados.
- Conclusão pode ser marcada e desmarcada.
- Treinos, conclusões e remoções permanecem após recarregar a página.
- Layout funciona em tela estreita e controles podem ser usados por teclado.
- Não há erros no console durante os fluxos principais.

## Validação executada

- Confirmados os sete dias, os estados vazios e a adição de mais de um treino no mesmo dia.
- Nome composto apenas por espaços foi recusado.
- Conclusão e dados permaneceram após recarregar a página.
- Remoção persistiu após recarregar; o armazenamento de teste foi limpo ao final.
- Em viewport de 390 px, a página não apresentou rolagem horizontal.
- Navegação por teclado manteve o foco após marcar e remover treinos.
- `node --check script.js` e diagnósticos do editor não apontaram erros.

## Backlog

- [ ] Editar treinos existentes.
- [ ] Planejar semanas com datas específicas e histórico.
- [ ] Adicionar duração, observações ou exercícios detalhados.
- [ ] Incluir estatísticas, lembretes ou sincronização entre dispositivos.

Atualize este arquivo junto com futuras mudanças de escopo e decisões do produto.