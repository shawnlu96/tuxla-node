import totp from 'totp-generator'
import freeze from "../../../utils/freeze.js";
async function multi(multiPage, account, nextStep){
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



export default multi;
