// Documentação da API no formato OpenAPI, exibida pelo Swagger em /docs

const erro = (descricao) => ({
  description: descricao,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } },
});

const parametroId = { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 };

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'API de Treinos Esportivos',
    version: '1.0.0',
    description:
      'Cadastro de jogadores e treinos, cálculo de carga e relatório semanal de sobrecarga.\n\n' +
      'Carga = (duração / 10) × intensidade × multiplicador (F = 1,5 | T = 1,2 | E = 1,0).\n\n' +
      'O indicador de risco é apenas didático, não é diagnóstico de lesão.',
  },
  servers: [{ url: 'http://localhost:3000' }],
  tags: [{ name: 'Jogadores' }, { name: 'Configuração' }, { name: 'Treinos' }, { name: 'Relatórios' }],

  components: {
    schemas: {
      Erro: { type: 'object', properties: { erro: { type: 'string' } } },
      Jogador: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Carlos Silva' },
          posicao: { type: 'string', enum: ['G', 'Z', 'M', 'A'], example: 'G' },
          ativo: { type: 'boolean', example: true },
        },
      },
      JogadorEntrada: {
        type: 'object',
        required: ['nome', 'posicao'],
        properties: {
          nome: { type: 'string', example: 'Pedro Santos' },
          posicao: { type: 'string', enum: ['G', 'Z', 'M', 'A'], description: 'G = Goleiro, Z = Zagueiro, M = Meio, A = Atacante', example: 'M' },
        },
      },
      Configuracao: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          cargaMaximaSemanal: { type: 'number', example: 300 },
          dataVigencia: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      ConfiguracaoEntrada: {
        type: 'object',
        required: ['cargaMaximaSemanal'],
        properties: {
          cargaMaximaSemanal: { type: 'number', example: 300 },
          dataVigencia: { type: 'string', example: '2026-10-01' },
        },
      },
      Treino: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 25 },
          codigo: { type: 'string', example: 'TR-100' },
          jogadorId: { type: 'integer', example: 2 },
          dataTreino: { type: 'string', format: 'date-time', example: '2026-10-19T08:00:00.000Z' },
          tipo: { type: 'string', enum: ['F', 'T', 'E'], example: 'F' },
          duracaoMin: { type: 'integer', example: 60 },
          intensidade: { type: 'integer', example: 8 },
          carga: { type: 'number', example: 72 },
        },
      },
      TreinoEntrada: {
        type: 'object',
        required: ['codigo', 'jogadorId', 'dataTreino', 'tipo', 'duracaoMin', 'intensidade'],
        properties: {
          codigo: { type: 'string', example: 'TR-100' },
          jogadorId: { type: 'integer', example: 2 },
          dataTreino: { type: 'string', description: 'AAAA-MM-DD ou AAAA-MM-DDTHH:mm:ss (UTC)', example: '2026-10-19T08:00:00' },
          tipo: { type: 'string', enum: ['F', 'T', 'E'], description: 'F = Físico, T = Técnico, E = Estratégico', example: 'F' },
          duracaoMin: { type: 'integer', minimum: 1, example: 60 },
          intensidade: { type: 'integer', minimum: 1, maximum: 10, example: 8 },
        },
      },
    },
  },

  paths: {
    '/jogadores': {
      post: {
        tags: ['Jogadores'],
        summary: 'Cadastrar atleta',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/JogadorEntrada' } } } },
        responses: {
          201: { description: 'Jogador cadastrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Jogador' } } } },
          400: erro('Dados inválidos (ex.: posição inexistente)'),
          500: erro('Erro interno'),
        },
      },
      get: {
        tags: ['Jogadores'],
        summary: 'Listar atletas',
        parameters: [
          { name: 'posicao', in: 'query', schema: { type: 'string', enum: ['G', 'Z', 'M', 'A'] } },
          { name: 'ativo', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
        ],
        responses: {
          200: { description: 'Lista de jogadores', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Jogador' } } } } },
          500: erro('Erro interno'),
        },
      },
    },
    '/jogadores/{id}': {
      get: {
        tags: ['Jogadores'],
        summary: 'Consultar atleta',
        parameters: [parametroId],
        responses: {
          200: { description: 'Jogador encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Jogador' } } } },
          404: erro('Jogador não encontrado'),
        },
      },
      put: {
        tags: ['Jogadores'],
        summary: 'Atualizar atleta',
        parameters: [parametroId],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/JogadorEntrada' }, example: { nome: 'Carlos Silva Jr.', posicao: 'G' } } },
        },
        responses: {
          200: { description: 'Jogador atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Jogador' } } } },
          400: erro('Dados inválidos'),
          404: erro('Jogador não encontrado'),
        },
      },
    },
    '/jogadores/{id}/desativar': {
      patch: {
        tags: ['Jogadores'],
        summary: 'Desativar atleta (mantém o histórico de treinos)',
        parameters: [parametroId],
        responses: { 200: { description: 'Jogador desativado' }, 404: erro('Jogador não encontrado') },
      },
    },
    '/configuracao': {
      get: {
        tags: ['Configuração'],
        summary: 'Consultar limite semanal de carga',
        responses: {
          200: { description: 'Configuração atual', content: { 'application/json': { schema: { $ref: '#/components/schemas/Configuracao' } } } },
          404: erro('Nenhuma configuração cadastrada'),
        },
      },
      put: {
        tags: ['Configuração'],
        summary: 'Cadastrar ou atualizar limite semanal de carga',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ConfiguracaoEntrada' } } } },
        responses: {
          200: { description: 'Configuração atualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Configuracao' } } } },
          201: { description: 'Configuração criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Configuracao' } } } },
          400: erro('Valor inválido'),
        },
      },
    },
    '/treinos': {
      post: {
        tags: ['Treinos'],
        summary: 'Registrar sessão de treino (a carga é calculada pela API)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TreinoEntrada' } } } },
        responses: {
          201: { description: 'Treino registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Treino' } } } },
          400: erro('Intensidade, duração, tipo ou data inválidos, ou jogador inativo'),
          404: erro('Jogador não encontrado'),
          409: erro('Código de treino já existe'),
        },
      },
      get: {
        tags: ['Treinos'],
        summary: 'Listar e filtrar sessões (com dados do jogador)',
        parameters: [
          { name: 'jogadorId', in: 'query', schema: { type: 'integer' } },
          { name: 'tipo', in: 'query', schema: { type: 'string', enum: ['F', 'T', 'E'] } },
          { name: 'posicao', in: 'query', schema: { type: 'string', enum: ['G', 'Z', 'M', 'A'] } },
          { name: 'dataInicio', in: 'query', schema: { type: 'string' }, example: '2026-10-05' },
          { name: 'dataFim', in: 'query', schema: { type: 'string' }, example: '2026-10-11' },
        ],
        responses: { 200: { description: 'Lista de treinos' }, 400: erro('Data inválida') },
      },
    },
    '/treinos/jogador/{id}': {
      get: {
        tags: ['Treinos'],
        summary: 'Treinos de um atleta',
        parameters: [parametroId],
        responses: { 200: { description: 'Jogador com a lista de treinos' }, 404: erro('Jogador não encontrado') },
      },
    },
    '/treinos/{codigo}': {
      delete: {
        tags: ['Treinos'],
        summary: 'Excluir sessão pelo código',
        parameters: [{ name: 'codigo', in: 'path', required: true, schema: { type: 'string' }, example: 'TR-100' }],
        responses: { 200: { description: 'Treino excluído' }, 404: erro('Treino não encontrado') },
      },
    },
    '/relatorios/semanal': {
      get: {
        tags: ['Relatórios'],
        summary: 'Relatório da semana (segunda a domingo) que contém a data informada',
        parameters: [{ name: 'data', in: 'query', required: true, schema: { type: 'string' }, example: '2026-10-05' }],
        responses: {
          200: { description: 'Relatório semanal' },
          400: erro('Data inválida'),
          404: erro('Limite semanal não configurado'),
        },
      },
    },
  },
};
