const express = require('express');
const router = express.Router();

const envController = require('../controllers/envController')

router.post('/start', envController.startEnv)
router.post('/create', envController.createEnv)

module.exports = router;