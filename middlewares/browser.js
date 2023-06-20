import puppeteer from 'puppeteer-extra';
import login from "./handlers/login/index.js";
import {multi} from "./handlers/multiFactor/index.js";
import {
    addAutoCheckbox,
    AddButtonForReEnterQueue,
    addHCaptchaEventHandler,
    addRecaptchaEventHandler
} from "./handlers/common/index.js";
import {onboarding, participating, quiz, residence} from "./handlers/register/index.js";
import {retry} from "../utils/utils.js";
import {loginRedirectLink} from "../utils/common.js";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export async function registerBrowser(puppeteerEndpoint, account) {
    const browser = await puppeteer.connect({
        browserWSEndpoint: puppeteerEndpoint,
        defaultViewport: null,
        args: ["--disable-site-isolation-trials"],
        protocolTimeout: 240000000
    })
    const pages = await browser.pages()
    for (let page of pages) {
        if (!page.url().includes('127.0.0.1')) {
            await page.close()
        }
    }
    const loginPages = new WeakSet()
    const logger = (message,...args) => console.log(`${account.accountName}: ${message}`, ...args)
    // common event handlers
    browser.on("targetcreated", async target => {
        if(target.type() === 'page'){
            const page = await target.page()
            if(page){
                // page.setRequestInterception(true)
                // await addHCaptchaEventHandler(account, page,logger)
                await addRecaptchaEventHandler(page, logger)
                await addAutoCheckbox(page)
                await AddButtonForReEnterQueue(account,page, logger)
            }
        }
    })
    // coinlist related event handlers
    browser.on("targetchanged", async target => {
        if (target.url().includes("https://coinlist.co/login")) {
            const loginPage = await target.page()
            if (loginPages.has(loginPage)) return
            console.log("Login triggered")
            loginPages.add(loginPage)
            try {
                await login(loginPage, account, logger,()=>loginPage.goto(loginRedirectLink))
                // after logging in, redirect to onboarding
            } catch (e) {
                console.error(e.message)
            } finally {
                loginPages.delete(loginPage)
            }
        } else if (target.url().includes("https://coinlist.co/multi_factor")) {
            const multiPage = await target.page();
            try {
                await multi(multiPage, account,()=>multiPage.goto(loginRedirectLink));
            } catch (e) {
                console.error(e.message)
            }
        }else if (target.url().startsWith("https://sales.coinlist.co/") && target.url().endsWith("onboarding")) {
            try {
                await onboarding(await target.page(), account, logger)
            }catch (e) {
                console.error(e.message)
            }
        }else if (target.url().startsWith("https://sales.coinlist.co/") && target.url().endsWith("new")) {
            try {
                await participating(await target.page(), account, logger)
            }catch (e) {
                console.error(e.message)
            }
        }else if(target.url().startsWith("https://sales.coinlist.co/") && target.url().endsWith("residence")){
            try {
                await residence(await target.page(), account, logger)
            }catch (e) {
                console.error(e.message)
            }
        }else if(target.url().startsWith("https://sales.coinlist.co/") && target.url().endsWith("quiz")){
            try {
                let redirect = false
                if(target.url().includes('neon')) redirect = true
                const page = await target.page()
                await quiz(page, account, logger)
                if(redirect){
                    await retry(()=> page.goto("https://sales.coinlist.co/archway-community-sale"))
                }
            }catch (e) {
                console.error(e.message)
            }
        }
    })
    return browser;
}


