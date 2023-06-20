import totp from 'totp-generator'
import freeze from "../../../utils/freeze.js";
import {retry, sleep} from "../../../utils/utils.js";
import axios from "axios";

export async function multi(multiPage, account, nextStep) {
    const codeInput = await multiPage.waitForSelector("#multi_factor_authentication_totp_otp_attempt")
    console.log(`${account.accountName}: multi factor page is ready`)
    const code = totp(account.secret)
    await codeInput.focus();
    await multiPage.keyboard.type(code)
    await multiPage.click('input[type="submit"]')
    await multiPage.waitForNavigation({waitUntil: "domcontentloaded"})
    //
    await nextStep?.()
}

export async function changeMulti(page, account) {
    await page.goto('https://coinlist.co/account/security')
    await page.bringToFront()
    const disableBtn = await page.waitForSelector('.market-accounts-security-totp_enabled input.c-button')
    await disableBtn.click()
    const pwdInput = await page.waitForSelector('#user_password')
    await pwdInput.focus()
    await page.keyboard.type(account.password)
    const oldMFA = totp(account.secret)
    const oldMFAInput = await page.waitForSelector('#mfa_code')
    await oldMFAInput.focus()
    await page.keyboard.type(oldMFA)
    await disableBtn.click()
    await sleep(1000)
    await page.waitForFunction(() => document.readyState === 'complete', {polling: 500, timeout: 300000})
    const newSecret = await page.evaluate("document.querySelector('code').textContent")
    const codeInput = await page.waitForSelector("#multi_factor_authentication_totp_otp_attempt")

    await retry(async () => {
        const response = await axios.put(`${process.env.TUXLA_API}/account/${account.id}`, {
            envId: account.envId,
            accountName: account.accountName,
            password: account.password,
            secret: newSecret,
            ipRegion: account.ipRegion
        })
        if (response.data.state !== 200) throw new Error("error occurred when updating")
        console.log("new MFA secret has been updated to DB.")
    })
    const newCode = totp(newSecret)
    await codeInput.focus()
    await page.keyboard.type(newCode)
    await page.click('#new_multi_factor_authentication_totp a')
}


