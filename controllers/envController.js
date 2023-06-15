import axios from "axios";
import moment from "moment";
import {heartbeat} from "../middlewares/heartbeat.js";
import {registerBrowser} from "../middlewares/browser.js";

import dotenv from 'dotenv';
import {getProxy} from "../middlewares/proxy.js";
import {get, set} from "../utils/data.js";
import login from "../middlewares/handlers/login/index.js";
import freeze from "../utils/freeze.js";
import {queueLink} from "../utils/common.js";

export async function recaptcha(req, res) {
    const envId = req.query.envId
    const {account, browser} = get(envId)
    const pages = await browser.pages()
    for (let page of pages) {
        await page.solveRecaptchas()
    }
    console.log(account.accountName + ': recaptcha sent')
    res.json({code: '0', message: 'ok'})
}

export async function requeue(req, res) {
    try {
        const envId = req.query.envId
        const {account, browser} = get(envId)
        const newPage = await browser.newPage()
        await newPage.goto(queueLink)
        await newPage.bringToFront()
        res.json({code: '0', message: 'ok'})
    }catch (e) {
        res.json({code:'1',message:e.message})
    }

}


dotenv.config();

export async function update(req, res) {
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


export async function startEnv(req, res) {
    const account = req.body
    try {
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
            const browser = await registerBrowser(response.data.data.ws.puppeteer, account);
            const loginPage = await browser.newPage()
            await loginPage.goto('https://coinlist.co/login')
            set(account.envId, {account, browser})
            await heartbeat()
        }
        res.json(response.data)
    } catch (e) {
        res.json({code: '1', error: e.message})
    }

}

export async function createEnv(req, res) {
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

export async function deleteEnv(req, res) {
    const envId = req.body.envId
    const data = JSON.stringify({user_ids: [envId]})
    const response = await axios.post(`${process.env.ADSPOWER_API}/user/delete`, data, {headers: {'Content-Type': 'application/json'}})
    res.json(response.data)

}
