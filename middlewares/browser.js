import puppeteer from 'puppeteer-extra';
import login from "./handlers/login/index.js";
import multi from "./handlers/multiFactor/index.js";

export async function registerBrowser(puppeteerEndpoint, account) {
    const loginPages = new WeakSet();
    const browser = await puppeteer.connect({browserWSEndpoint: puppeteerEndpoint, defaultViewport: null})
    const status = 1
    browser.on("targetchanged", async target => {
        if (target.url().includes("https://coinlist.co/login")) {
            console.log("Login triggered")
            // const loginPage = await target.page();
            // if(loginPages.has(loginPage)) return;
            // loginPages.add(loginPage)
            // try {
            //     await login(loginPage, account)
            // } catch (e) {
            //     console.error(e.message)
            // } finally {
            //     loginPages.delete(loginPage)
            // }
        }else if (target.url().includes("https://coinlist.co/multi_factor")) {
            const multiPage = await target.page();
            try {
                await multi(multiPage, account);
            } catch (e) {
                console.error(e.message)
            }
        }
    })
    return browser;
}


