import dotenv from 'dotenv';
dotenv.config();
import cron from 'node-cron'
import {heartbeat} from "./middlewares/heartbeat.js";
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import router from "./routes/env.js";
import puppeteer from "puppeteer-extra";
import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";
const app = express();

puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: '2captcha',
            token: 'ea4c62bf044091b26bc81f172976aa68' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
        },
        visualFeedback: false, // colorize reCAPTCHAs (violet = detected, green = solved)
    })
)

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'))
// 允许所有来源的请求
app.use(cors());

app.use('/env', router);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});

heartbeat().then(res => res)

// process.on('unhandledRejection', (err, promise) => {
//     console.error('Unhandled Rejection at:', promise, 'reason:', err);
//     // 进行适当的错误处理，例如记录错误并重新启动服务器
// });

// 15秒心跳轮询请求
cron.schedule('*/15 * * * * *', async () => {
    try {
        await heartbeat()
    } catch (e) {
        console.error(e,'error occurred when sending heartbeat')
    }
})
