import express from 'express';
import * as envController from "../controllers/envController.js";

const router = express.Router();

router.post('/start', envController.startEnv)
router.post('/create', envController.createEnv)
router.post('/delete', envController.deleteEnv)
router.post('/update', envController.update)
router.get('/recaptcha', envController.recaptcha)
router.get('/requeue', envController.requeue)
router.get('/requeuenew', envController.requeuenew)

export default router;
