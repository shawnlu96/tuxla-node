import axios from "axios";
import {getAll, remove} from "../utils/data.js";
import {retry} from "../utils/utils.js";

const getCurrentIP = async () => {
    const ipResponse = await axios.get("https://api.ipify.org")
    console.log('current ip:', ipResponse.data)
    return ipResponse.data
}

let currentIP = null

export async function heartbeat() {
    await retry(async () => {
        if(!currentIP){
            currentIP = await getCurrentIP()
        }
    },10,3000 )

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

    const response = await axios.post(`${process.env.TUXLA_API}/server/heartbeat`, {
        ip: currentIP,
        envIds: getAll().map(kv => kv.key)
    })
}

