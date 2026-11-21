const { Router } = require('express');
const controller = require('../controllers/treinoController');

const router = Router();

router.post('/', controller.registrarTreino);
router.get('/', controller.listarTreinos);
router.get('/jogador/:id', controller.listarTreinosDoJogador);
router.delete('/:codigo', controller.excluirTreino);

module.exports = router;
