const { Router } = require('express');
const controller = require('../controllers/configuracaoController');

const router = Router();

router.get('/', controller.consultarConfiguracao);
router.put('/', controller.salvarConfiguracao);

module.exports = router;
