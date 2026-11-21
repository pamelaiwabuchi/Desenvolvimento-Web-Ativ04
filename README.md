# API de Treinos Esportivos

API REST para um clube de futebol registrar os treinos dos atletas, calcular a carga de treinamento e gerar um relatório semanal com os jogadores em **risco de sobrecarga**.

Tecnologias: **Node.js, Express, MySQL, Sequelize (ORM), dotenv e Swagger**.

> O indicador de risco é apenas didático e não é um diagnóstico de lesão.

## Como executar

### 1. Pré-requisitos
- Node.js 18 ou mais recente
- MySQL rodando

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar o `.env`
Copie o arquivo de exemplo e preencha com o seu usuário e a sua senha do MySQL:
```bash
cp .env.example .env
```

### 4. Criar o banco, as tabelas e os dados de teste
```bash
npm run db:create    # cria o banco treinos_esportivos
npm run db:migrate   # cria as tabelas (migrations)
npm run db:seed      # insere 8 jogadores, 24 treinos e o limite semanal (seeders)
```
Para apagar tudo e recomeçar do zero: `npm run db:reset`.

### 5. Iniciar a API
```bash
npm start        # ou: npm run dev (reinicia sozinho ao salvar)
```
- API: http://localhost:3000
- Swagger: **http://localhost:3000/docs**

## Estrutura de pastas

```
src/
├── config/database.js    # conexão com o MySQL (lê o .env)
├── models/               # Jogador, Treino, Configuracao + associações (index.js)
├── migrations/           # criação das tabelas
├── seeders/              # dados de teste
├── services/             # regras de negócio e acesso ao banco (Sequelize)
├── controllers/          # recebem a requisição e devolvem a resposta
├── routes/               # endereços da API
├── utils/                # tratamento de erros e de datas
├── docs/swagger.js       # documentação do Swagger
├── app.js                # configura o Express
└── server.js             # conecta no banco e inicia o servidor
```

## Rotas

| Método | Endpoint | Finalidade |
|---|---|---|
| POST | /jogadores | Cadastrar atleta |
| GET | /jogadores | Listar atletas (filtros: `posicao`, `ativo`) |
| GET | /jogadores/:id | Consultar atleta |
| PUT | /jogadores/:id | Atualizar atleta |
| PATCH | /jogadores/:id/desativar | Desativar atleta |
| GET / PUT | /configuracao | Consultar ou atualizar o limite semanal |
| POST | /treinos | Registrar sessão |
| GET | /treinos | Listar sessões (filtros: `jogadorId`, `tipo`, `posicao`, `dataInicio`, `dataFim`) |
| GET | /treinos/jogador/:id | Treinos de um atleta |
| DELETE | /treinos/:codigo | Excluir sessão |
| GET | /relatorios/semanal?data=2026-10-05 | Relatório da semana |

## Regras de negócio

- Posições: G (Goleiro), Z (Zagueiro), M (Meio-campo), A (Atacante)
- Tipos de treino e multiplicadores: F (Físico) 1,5 · T (Técnico) 1,2 · E (Estratégico) 1,0
- **Carga = (duração em minutos / 10) × intensidade × multiplicador**
- A intensidade vai de 1 a 10, a duração tem que ser maior que zero e o código do treino não pode se repetir
- Só jogadores **ativos** podem receber treinos novos. Desativar um jogador não apaga o histórico dele.
- A semana vai de segunda a domingo. **RISCO DE SOBRECARGA** só quando a carga semanal é **maior** que o limite; se for igual, não é risco.
- As datas são tratadas em UTC. Envie `AAAA-MM-DD` ou `AAAA-MM-DDTHH:mm:ss`.

## Códigos HTTP usados

| Código | Quando |
|---|---|
| 200 | Consulta, atualização ou exclusão feita |
| 201 | Registro criado |
| 400 | Dado inválido (intensidade, duração, tipo, data, jogador inativo, JSON mal formatado) |
| 404 | Jogador, treino, configuração ou rota não encontrados |
| 409 | Código de treino repetido |
| 500 | Erro interno, com mensagem genérica e sem detalhes do banco |

## Outros documentos
- [TESTES.md](TESTES.md): roteiro dos testes obrigatórios, com os resultados esperados
- [EXPLICACAO.md](EXPLICACAO.md): onde foram usados o Sequelize e o async/await, e como as tabelas são criadas
