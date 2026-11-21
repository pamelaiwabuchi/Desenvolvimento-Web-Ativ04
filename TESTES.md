# Testes obrigatórios

**Antes de começar**, no terminal:
```bash
npm run db:reset
npm start
```
Abra http://localhost:3000/docs. Em cada teste: abra a rota, clique em **Try it out**, preencha, clique em **Execute** e **tire o print**.

---

### ☐ 1. Atletas e treinos cadastrados
- `GET /jogadores` → Execute. Esperado: 8 jogadores, com as posições G, Z, M e A.
- `GET /treinos` → Execute. Esperado: 24 treinos, com os tipos F, T e E.

### ☐ 2. Limite configurado
- `GET /configuracao` → Execute. Esperado: `"cargaMaximaSemanal": 300`.

### ☐ 3. Carga conferida à mão
- `POST /treinos`, com o corpo:
```json
{ "codigo": "TR-100", "jogadorId": 2, "dataTreino": "2026-10-19T08:00:00", "tipo": "F", "duracaoMin": 60, "intensidade": 8 }
```
- Esperado: **201** com `"carga": 72`. Conta à mão: (60 / 10) × 8 × 1,5 = 72.

### ☐ 4. Código duplicado
- `POST /treinos` → clique em **Execute de novo**, com o mesmo corpo do teste 3.
- Esperado: **409**.

### ☐ 5. Intensidade inválida
- `POST /treinos`, com o corpo:
```json
{ "codigo": "TR-101", "jogadorId": 2, "dataTreino": "2026-10-19", "tipo": "F", "duracaoMin": 60, "intensidade": 11 }
```
- Esperado: **400**.

### ☐ 6. Duração não positiva
- `POST /treinos`, com o corpo:
```json
{ "codigo": "TR-102", "jogadorId": 2, "dataTreino": "2026-10-19", "tipo": "T", "duracaoMin": 0, "intensidade": 5 }
```
- Esperado: **400**.

### ☐ 7. Atleta inexistente
- `POST /treinos`, com o corpo:
```json
{ "codigo": "TR-103", "jogadorId": 999, "dataTreino": "2026-10-19", "tipo": "E", "duracaoMin": 30, "intensidade": 5 }
```
- Esperado: **404**.

### ☐ 8. Atleta inativo
- `POST /treinos`, com o corpo:
```json
{ "codigo": "TR-104", "jogadorId": 8, "dataTreino": "2026-10-19", "tipo": "E", "duracaoMin": 30, "intensidade": 5 }
```
- Esperado: **400**.

### ☐ 9. Relatório de duas semanas
- `GET /relatorios/semanal` com data = `2026-10-05` → Execute.
  - Esperado: o Mateus com 333,9 em **RISCO DE SOBRECARGA** (acima do limite) e os outros **OK** (abaixo).
- `GET /relatorios/semanal` com data = `2026-10-14` → Execute.
  - Esperado: o Felipe com 313,2 em **RISCO DE SOBRECARGA**.
- No trabalho, escreva uma frase comparando as semanas: "Na semana 1, o Mateus estava em risco. Na semana 2, ele treinou pouco e quem ficou em risco foi o Felipe."

### ☐ 10. Falha sem vazar a senha
- Num segundo terminal, desligue o banco: `docker stop treinos-mysql-teste`
- `GET /jogadores` → Execute. Esperado: **500** com `"Erro interno do servidor."`, sem senha nem detalhes do banco.
- Ligue o banco de novo: `docker start treinos-mysql-teste`
