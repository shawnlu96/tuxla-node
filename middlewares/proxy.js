const crypto = require('crypto');
const request = require("request");

async function getProxy(region) {
    if(!region || region.trim().length===0) return null
    for (let i = 0; i < 10; i++) {
        const proxy = generateProxy(region ?? 'sg')
        if(await checkLocalProxy(`http://${proxy.user}:${proxy.password}@${proxy.host}:${proxy.port}`)) return proxy
    }
    return null
}

const checkLocalProxy = function(proxyUrl){
    return new Promise((resolve, reject) => {
        const req = request(
            {
                url:'https://coinlist.co/assets/index/new_home/icon_first-95d2a45595679fb545cc998faa7b488e2b926c78bfe6b9539387dcd59d64c10a.svg',
                proxy: proxyUrl,
            }
            ,(err, response,body) => {
                if(!err && response.statusCode === 200){
                    resolve(true)
                } else {
                    resolve(false)
                }
            }
        )

        setTimeout(() => {
            req.abort();
            resolve(false);
        }, 5000)
    })
}

function generateProxy(region) {
    return {
        host: "geo.iproyal.com",
        port: "12321",
        user:"tuxla",
        password:`test1234_country-${region}_session-${newRandomId(8)}_lifetime-24h`
    }


}

function newRandomId(length) {
    const buffer = crypto.randomBytes(6);
    const base64 = buffer.toString('base64');
    return base64.replace(/[+/=]/g, '').substring(0, length).toLowerCase();
}

module.exports = {getProxy}