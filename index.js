require('dotenv').config();
const cron = require('node-cron');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const ip = require('ip');
const cors = require('cors');


const envRouter = require('./routes/env');
const axios = require("axios");
const {getAll, remove} = require("./utils/data");
const currentIP = ip.address()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// 允许所有来源的请求
app.use(cors());

app.use('/env', envRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});

// process.on('unhandledRejection', (err, promise) => {
//     console.error('Unhandled Rejection at:', promise, 'reason:', err);
//     // 进行适当的错误处理，例如记录错误并重新启动服务器
// });

// 15秒心跳轮询请求
cron.schedule('*/15 * * * * *', async () => {
    const entryToDelete = []
    for (const {key, value} of getAll()) {
        const res = await axios.get(`${process.env.TUXLA_API}/browser/active?user_id=${key}`)
        if(res.data.data.status !== "Active") entryToDelete.push(key)
    }

    for (let envId of entryToDelete) {
        remove(envId)
    }

    const response = await axios.post(`${process.env.TUXLA_API}/server/heartbeat`,{
        ip: currentIP,
        envIds: getAll().map(({k,_}) => k)
    })
})
