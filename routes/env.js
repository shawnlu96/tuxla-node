const express = require('express');
const router = express.Router();

const envController = require('../controllers/envController')

router.post('/start', envController.startEnv)
router.post('/create', envController.createEnv)
router.post('/delete', envController.deleteEnv)
router.post('/update', envController.update)

module.exports = router;