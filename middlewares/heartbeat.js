const {getAll, remove} = require("../utils/data");
const axios = require("axios");
const ip = require('ip');
const currentIP = ip.address()

async function heartbeat(){
    const entryToDelete = []
    for (const {key, value} of getAll()) {
        try {
            const res = await axios.get(`${process.env.ADSPOWER_API}/browser/active?user_id=${key}`)
            if (res.data.data.status !== "Active") entryToDelete.push(key)
        } catch (e) {
            entryToDelete.push(key)
        }

    }



    for (let envId of entryToDelete) {
        remove(envId)
    }
    console.log(getAll())

    const response = await axios.post(`${process.env.TUXLA_API}/server/heartbeat`,{
        ip: currentIP,
        envIds: getAll().map(kv => kv.key)
    })
}

module.exports = {heartbeat}