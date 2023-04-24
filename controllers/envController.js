const {getProxy} = require("../middlewares/proxy");
const axios = require("axios");
const moment = require("moment")
const {set} = require("../utils/data");
const {heartbeat} = require("../middlewares/heartbeat");
require('dotenv').config();

async function update(req, res) {
    const account = req.body
    const proxy = await getProxy(account.ipRegion)

    const data = {
        "user_id": account.envId,
        "name": account.accountName,
        "username": account.accountName,
        "password": account.password,
        "user_proxy_config": proxy ? {
            "proxy_soft": "other",
            "proxy_type": "http",
            "proxy_host": proxy.host,
            "proxy_port": proxy.port,
            "proxy_user": proxy.user,
            "proxy_password": proxy.password
        } : {"proxy_soft": "no_proxy"}
    }
    const response = await axios.post(`${process.env.ADSPOWER_API}/user/update`, data, {headers: {'Content-Type': 'application/json'}})
    res.json(response.data)
}

async function startEnv(req, res) {

    const account = req.body
    // 超过4h就重新设置代理
    if (moment.utc(account.updateTime).isBefore(moment.utc().subtract(4, 'hours'))) {
        const proxy = await getProxy(account.ipRegion)
        const data = {
            "user_id": account.envId,
            "user_proxy_config": proxy ? {
                "proxy_soft": "other",
                "proxy_type": "http",
                "proxy_host": proxy.host,
                "proxy_port": proxy.port,
                "proxy_user": proxy.user,
                "proxy_password": proxy.password
            } : {"proxy_soft": "no_proxy"}
        }
        const response = await axios.post(`${process.env.ADSPOWER_API}/user/update`, data, {headers: {'Content-Type': 'application/json'}})
        if (response.data.code === 0) console.log("proxy updated", account.envId, proxy)
    }
    const response = await axios.get(`${process.env.ADSPOWER_API}/browser/start?user_id=${account.envId}`)
    if (response.data.code === 0) {
        set(account.envId, account)
        await heartbeat()
    }
    res.json(response.data)
}

async function createEnv(req, res) {
    const account = req.body
    const proxy = await getProxy(account.ipRegion)

    const data = JSON.stringify({
        "group_id": "0",
        "domain_name": "coinlist.co",
        "name": account.accountName,
        "open_urls": [
            "https://coinlist.co/login"
        ],
        "username": account.accountName,
        "password": account.password,
        "user_proxy_config": proxy ? {
            "proxy_soft": "other",
            "proxy_type": "http",
            "proxy_host": proxy.host,
            "proxy_port": proxy.port,
            "proxy_user": proxy.user,
            "proxy_password": proxy.password
        } : {"proxy_soft": "no_proxy"}
    });

    const response = await axios.post(`${process.env.ADSPOWER_API}/user/create`, data, {headers: {'Content-Type': 'application/json'}})
    const envId = response.data.data.id
    await axios.put(`${process.env.TUXLA_API}/account/${account.id}/`, {envId: envId})
    res.json({code: 0, message: "success"})

}

async function deleteEnv(req, res) {
    const envId = req.body.envId
    const data = JSON.stringify({user_ids: [envId]})
    const response = await axios.post(`${process.env.ADSPOWER_API}/user/delete`, data, {headers: {'Content-Type': 'application/json'}})
    res.json(response.data)

}

module.exports = {
    startEnv, createEnv, deleteEnv, update
}