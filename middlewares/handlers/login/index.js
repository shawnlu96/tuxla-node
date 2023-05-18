import freeze from "../../../utils/freeze.js";

async function login(loginPage, account) {
    try {

        loginPage.on("request", async (request) => {
            const url = await request.url();
            if (url.includes("https://imgs.hcaptcha.com/") || url.includes("https://bam-cell.nr-data.net/events/1")) {
                console.log("hCaptcha found.")
                try {
                    await loginPage.solveRecaptchas()
                }catch (e){
                    console.error(e.message)
                }
            }
        });

        // loginPage.on("response", async (response) => {
        //     const url = await response.url();
        //     if (url.includes("https://coinlist.co/users/login")) {
        //         console.log(response.status())
        //         console.log("登入成功，正在重定向到：" + response.headers().location)
        //     }
        // })

        const handleHCaptcha = async () => {
                // const isCaptcha = await loginPage.evaluate(() => {
                //     const iframes = document.getElementsByTagName('iframe');
                //     for (const iframe of iframes) {
                //         if (iframe.title === 'hCaptcha') {
                //             const node = iframe.parentNode.parentNode;
                //             const style = node.style;
                //             return style.opacity + '' === '1';
                //         }
                //     }
                // }).catch(err => {
                //     console.log(err.message);
                // });
                //
                // if (isCaptcha) {
                //     await loginPage.solveRecaptchas()
                // }
            };
        await loginPage.goto("https://coinlist.co/login")
        await loginPage.waitForNetworkIdle({idleTime:500, timeout:200000})
        await loginPage.waitForFunction(() => !document.body.innerText.includes('Cloudflare'), {timeout:120000});
        await loginPage.waitForFunction(() => document.readyState === 'complete',{timeout:120000})
        console.log(`${account.accountName}: Login page is ready.`)
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
        console.error(e, "error occurred when logging in.")
        return false;
    }
    return true;
}

export default login;