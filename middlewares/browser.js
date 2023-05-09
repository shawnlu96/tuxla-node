const axios = require("axios");
const {get} = require("../utils/data");
const puppeteer = require('puppeteer-core');


async function testMethod(envId) {
    const {account, handle} = get(envId)
    console.log(handle)
    const puppUrl = handle.ws.puppeteer
    const browser = await puppeteer.connect({browserWSEndpoint: puppUrl, defaultViewport:null});
    const page = await  browser.newPage()
    await page.goto('https://coinlist.co/login')

    const emailInput = await page.waitForSelector('#user_email')
    const pwdInput = await page.waitForSelector('#user_password')
    await emailInput.focus()
    // await page.evaluate(text => pwdInput.value=text, account.password)
    await page.keyboard.type(account.accountName)
    await pwdInput.focus()
    await page.keyboard.type(account.password)
    await page.click('input[type="submit"]')

}


module.exports =  {
    testMethod
}