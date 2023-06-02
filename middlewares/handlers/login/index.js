import freeze from "../../../utils/freeze.js";

async function login(loginPage, account,logger, nextStep) {
    try {
        // Capture the redirected URL when a 302 request is intercepted
        // loginPage.on('request', interceptedRequest => {
        //     if (interceptedRequest.isNavigationRequest() && interceptedRequest.redirectChain().length > 0) {
        //         const redirectedUrl = interceptedRequest.redirectChain()[interceptedRequest.redirectChain().length - 1].response().headers().location;
        //         logger(`302 redirection detected to ${redirectedUrl}`);
        //     }
        //     interceptedRequest.continue();
        // });


        await loginPage.waitForFunction(() => {
            return document.readyState === 'complete' && !document.body.innerText.includes('Cloudflare')
        }, {polling: 500, timeout: 300000})
        // if already signed in
        if (await loginPage.evaluate(() => document.body.innerText.includes('You are already signed in.'))) {
            logger(`already signed in`)
            await nextStep?.()
            return true
        }
        logger(`Login page is ready.`)
        // actual login
        const emailInput = await loginPage.waitForSelector('#user_email')
        const pwdInput = await loginPage.waitForSelector('#user_password')
        await emailInput.focus()
        await emailInput.click({clickCount: 3, delay: 50})
        await loginPage.keyboard.type(account.accountName)
        await pwdInput.focus()
        await pwdInput.click({clickCount: 3, delay: 50})
        await loginPage.keyboard.type(account.password)
        await loginPage.click('input[type="submit"]')
    } catch (e) {
        console.error("error occurred when logging in.", e)
        return false;
    }
    return true;
}

export default login;
