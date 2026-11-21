const { Router } = require('express');
const controller = require('../controllers/relatorioController');

const router = Router();

router.get('/semanal', controller.gerarRelatorioSemanal);

module.exports = router;
