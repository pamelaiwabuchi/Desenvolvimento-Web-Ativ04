# Onde usamos o Sequelize e o async/await

## O que é o Sequelize
O Sequelize é um **ORM**: ele traduz código JavaScript em comandos SQL. Por exemplo, em vez de escrever `SELECT * FROM jogadores WHERE id = 1`, escrevemos `Jogador.findByPk(1)`. Neste projeto, as funcionalidades não têm nenhum SQL escrito à mão.

## Criação das tabelas: migrations
As tabelas são criadas com **migrations do Sequelize CLI** (pasta `src/migrations`). Cada migration tem duas funções:
- `up`: cria a tabela (`queryInterface.createTable`)
- `down`: desfaz, apagando a tabela

O comando `npm run db:migrate` roda só as migrations que ainda não rodaram. O Sequelize guarda o controle disso numa tabela chamada `SequelizeMeta`, então os dados já salvos não são apagados. Por isso **não usamos `sync({ force: true })`**: ele apaga e recria as tabelas, e todos os dados se perderiam.

Os **seeders** (`src/seeders`) inserem os dados de teste com `queryInterface.bulkInsert`.

## Models e validações (`src/models`)
Cada model descreve uma tabela usando `sequelize.define` e os tipos de `DataTypes` (INTEGER, STRING, ENUM, BOOLEAN, DATE, DECIMAL). As validações ficam dentro de `validate`:
- `intensidade`: `min: 1` e `max: 10`
- `duracaoMin`: `min: 1`
- `codigo`: `unique: true`
- `tipo` e `posicao`: `ENUM` com `isIn`

## Associações (`src/models/index.js`)
```js
Jogador.hasMany(Treino, { foreignKey: 'jogadorId', as: 'treinos' });  // 1 jogador tem N treinos
Treino.belongsTo(Jogador, { foreignKey: 'jogadorId', as: 'jogador' }); // cada treino é de 1 jogador
```
Com essas associações, podemos usar `include` para trazer dados das duas tabelas juntos:
- `GET /treinos` traz cada treino com os dados do jogador (`include: Jogador`, que vem do belongsTo)
- `GET /treinos/jogador/:id` traz o jogador com a lista de treinos dele (`include: Treino`, que vem do hasMany)

## Métodos do Sequelize usados

| Função | Arquivo | Método do Sequelize |
|---|---|---|
| cadastrarJogador() | jogadorService.js | `Jogador.create()` |
| listarJogadores() | jogadorService.js | `Jogador.findAll({ where })` |
| buscarJogador() | jogadorService.js | `Jogador.findByPk()` |
| atualizarJogador() | jogadorService.js | `instância.update()` |
| desativarJogador() | jogadorService.js | `instância.update({ ativo: false })` |
| registrarTreino() | treinoService.js | `findByPk()`, `findOne()`, `Treino.create()` |
| listarTreinos() | treinoService.js | `findAll()` com `include`, `where` e `Op.between` |
| excluirTreino() | treinoService.js | `findOne()` + `instância.destroy()` |
| calcularCarga() | cargaService.js | função pura, sem banco (regra de negócio reutilizada) |
| gerarRelatorioSemanal() | relatorioService.js | `count()`, `fn('SUM')`, `fn('COUNT')`, `fn('AVG')`, `col()`, `group`, `include`, `Op.between` |
| consultar/salvarConfiguracao() | configuracaoService.js | `findOne()`, `create()`, `update()` |

### Exemplo de agregação (relatório)
```js
Treino.findAll({
  attributes: ['jogadorId', [fn('SUM', col('carga')), 'cargaSemanal'], [fn('COUNT', col('Treino.id')), 'quantidadeTreinos']],
  include: [{ model: Jogador, as: 'jogador', attributes: ['nome', 'posicao'] }],
  where: { dataTreino: { [Op.between]: [inicio, fim] } },
  group: ['jogadorId', 'jogador.id', 'jogador.nome', 'jogador.posicao'],
});
```
Essa consulta soma a carga e conta os treinos de cada jogador na semana. É o mesmo que um `SELECT ... SUM(carga) ... GROUP BY jogadorId`.

## Onde usamos async/await
Acessar o banco leva tempo, por isso todos os métodos do Sequelize devolvem uma **Promise**. Usamos `await` para esperar o resultado antes de continuar:

```js
async function buscarJogador(id) {
  const jogador = await Jogador.findByPk(id); // espera o banco responder
  if (!jogador) throw criarErro(404, 'Jogador não encontrado.');
  return jogador;
}
```

- **Services:** todas as funções são `async` e usam `await` nas chamadas ao Sequelize.
- **Controllers:** são `async`, usam `await` para chamar o service e ficam dentro de um **try/catch**. Se der erro, o `catch` chama `tratarErro`, que devolve o código HTTP certo (400, 404, 409 ou 500).
- **Relatório:** as 4 consultas não dependem uma da outra, então rodam ao mesmo tempo com `await Promise.all([...])`.
- **server.js:** `await sequelize.authenticate()` testa a conexão com o banco antes de ligar o servidor.
- **Migrations e seeders:** as funções `up` e `down` também são `async`.

## Tratamento de erros (`src/utils/erros.js`)
- Erros esperados, como "não encontrado", são criados com `criarErro(status, mensagem)`.
- `ValidationError` do Sequelize (validação do model) vira **400**.
- `UniqueConstraintError` (valor único repetido) vira **409**.
- Qualquer outro erro vira **500** com a mensagem genérica "Erro interno do servidor.". O detalhe aparece só no terminal do servidor, nunca na resposta, então senha e dados do banco não vazam.
- A senha do banco fica no `.env`, que não vai para o GitHub (está no `.gitignore`). Para o GitHub vai só o `.env.example`, sem senha real.
