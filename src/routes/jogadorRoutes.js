const { Router } = require('express');
const controller = require('../controllers/jogadorController');

const router = Router();

router.post('/', controller.cadastrarJogador);
router.get('/', controller.listarJogadores);
router.get('/:id', controller.buscarJogador);
router.put('/:id', controller.atualizarJogador);
router.patch('/:id/desativar', controller.desativarJogador);

module.exports = router;
