import totp from 'totp-generator'
import freeze from "../../../utils/freeze.js";
async function multi(multiPage, account){
    let captchaPresent = false;
    const handleSuccess = freeze(async (location) => {
        console.log("二次认证成功，正在重定向到：" + location)
        await multiPage.goto("https://sales.coinlist.co/queue/enter_queue/cyberconnect")
    }, 10000)

    multiPage.on("request", async request =>{
        const url = await request.url()
        if(url.includes('www.google.com/recaptcha')){
            if(captchaPresent) return
            captchaPresent = true
            try{
                await multiPage.waitForFunction(()=>document.readyState === 'complete', {timeout:320000})
                console.log("尝试过recaptcha")
                await multiPage.solveRecaptchas()
                console.log("captcha resolved")
            }catch (e){
                console.error(e.message,"captcha error")
            }finally {
                captchaPresent = false
            }
        }
    })


    const codeInput = await multiPage.waitForSelector("#multi_factor_authentication_totp_otp_attempt")
    console.log(`${account.accountName}: multi factor page is ready`)
    const code = totp(account.secret)
    await codeInput.focus();
    await multiPage.keyboard.type(code)
    await multiPage.click('input[type="submit"]')
    await sleep(10000)
    await multiPage.goto("https://sales.coinlist.co/queue/enter_queue/cyberconnect")
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default multi;