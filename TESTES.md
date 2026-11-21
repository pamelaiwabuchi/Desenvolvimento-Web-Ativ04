# Roteiro de testes

Antes de começar, rode `npm run db:reset` para deixar o banco com os dados de teste originais. Depois abra http://localhost:3000/docs, faça cada teste no Swagger (**Try it out → Execute**) e tire um print da resposta.

## Massa de dados (seeders)

- **8 jogadores**, cobrindo as 4 posições: 2 G, 2 Z, 2 M e 2 A. O João Mendes (id 8) está **inativo**.
- **24 treinos** com os 3 tipos, divididos em duas semanas:
  - Semana 1: de 05/10/2026 a 11/10/2026, com 15 treinos
  - Semana 2: de 12/10/2026 a 18/10/2026, com 9 treinos
- **Limite semanal: 300 pontos**

## 1. Conferir a carga calculada à mão

`POST /treinos`
```json
{ "codigo": "TR-100", "jogadorId": 2, "dataTreino": "2026-10-19T08:00:00", "tipo": "F", "duracaoMin": 60, "intensidade": 8 }
```
Conta feita à mão: (60 / 10) × 8 × 1,5 = **72**. Resultado esperado: **201**, com `"carga": 72`.

## 2. Código duplicado
Envie o mesmo JSON do teste 1 de novo. Esperado: **409**, `"Já existe um treino com o código TR-100."`

## 3. Intensidade inválida
```json
{ "codigo": "TR-101", "jogadorId": 2, "dataTreino": "2026-10-19", "tipo": "F", "duracaoMin": 60, "intensidade": 11 }
```
Esperado: **400**, `"A intensidade deve ser um número inteiro de 1 a 10."`

## 4. Duração não positiva
```json
{ "codigo": "TR-102", "jogadorId": 2, "dataTreino": "2026-10-19", "tipo": "T", "duracaoMin": 0, "intensidade": 5 }
```
Esperado: **400**, `"A duração deve ser um número inteiro maior que zero."`

## 5. Atleta inexistente
```json
{ "codigo": "TR-103", "jogadorId": 999, "dataTreino": "2026-10-19", "tipo": "E", "duracaoMin": 30, "intensidade": 5 }
```
Esperado: **404**, `"Jogador não encontrado."`

## 6. Atleta inativo
```json
{ "codigo": "TR-104", "jogadorId": 8, "dataTreino": "2026-10-19", "tipo": "E", "duracaoMin": 30, "intensidade": 5 }
```
Esperado: **400**, `"Não é possível registrar treino para um jogador inativo."`

Depois faça `GET /treinos/jogador/8`: o treino antigo dele (TR-015) continua lá, porque o histórico foi preservado.

## 7. Relatório de duas semanas diferentes

`GET /relatorios/semanal?data=2026-10-05` (semana 1):

| Jogador | Carga semanal | Treinos | Situação |
|---|---|---|---|
| Mateus Rocha (A) | 333,9 | 4 | **RISCO DE SOBRECARGA** |
| Lucas Pereira (M) | 300 | 2 | OK (empate com o limite, não é risco) |
| Rafael Souza (Z) | 178,2 | 3 | OK |
| Diego Alves (M) | 144,9 | 3 | OK |
| Carlos Silva (G) | 48 | 2 | OK |
| João Mendes (G) | 32,4 | 1 | OK |

- Total: 15 treinos. Maior carga: Mateus. Menor carga: João. Em risco: 1.
- Média por tipo: F = 102,64 · T = 49,68 · E = 23,5
- Por posição (treinos / média por sessão): G 3 / 26,8 · Z 3 / 59,4 · M 5 / 88,98 · A 4 / 83,48

`GET /relatorios/semanal?data=2026-10-14` (semana 2):

| Jogador | Carga semanal | Treinos | Situação |
|---|---|---|---|
| Felipe Costa (A) | 313,2 | 3 | **RISCO DE SOBRECARGA** |
| Bruno Lima (Z) | 217,2 | 3 | OK |
| Carlos Silva (G) | 45 | 1 | OK |
| Diego Alves (M) | 43,2 | 1 | OK |
| Mateus Rocha (A) | 16 | 1 | OK |

- Total: 9 treinos. Maior carga: Felipe. Menor carga: Mateus. Em risco: 1.
- Média por tipo: F = 92,25 · T = 69,2 · E = 29
- Por posição: G 1 / 45 · Z 3 / 72,4 · M 1 / 43,2 · A 4 / 82,3

Comparando as duas semanas: o Mateus estava em risco na semana 1 e teve a menor carga na semana 2. O Felipe e o Bruno só treinaram na semana 2, então só aparecem nos rankings dessa semana (o critério é ter pelo menos um treino na semana).

**Semana sem treinos:** `GET /relatorios/semanal?data=2026-10-26` devolve `totalTreinos: 0`, listas vazias e a mensagem "Nenhum treino registrado nesta semana." (Use 26/10 porque, se você fez o teste 1, a semana de 19/10 agora tem o treino TR-100.)

## 8. Falha sem vazar credenciais

Com a API rodando, pare o MySQL e chame `GET /jogadores`. Esperado: **500**, `{"erro": "Erro interno do servidor."}`. A resposta não mostra a senha, o usuário nem detalhes do banco.

## Outros testes úteis
- `POST /jogadores` com `"posicao": "Q"`: **400**
- `GET /jogadores/999`: **404**
- `DELETE /treinos/TR-100`: **200**. Repetir o mesmo DELETE: **404**
- `PUT /configuracao` com `{"cargaMaximaSemanal": -5}`: **400**
- `GET /treinos?tipo=E&dataInicio=2026-10-05&dataFim=2026-10-11`: só os treinos estratégicos da semana 1
