import {sleep} from "../../../utils/utils.js";

export async function onboarding(page, account, logger){
    await page.waitForFunction(()=>document.readyState==='interactive')
    const button = await page.waitForSelector('.c-button.c-button--large')
    await button.click()
    await page.waitForNavigation()
    logger('onboarding finished.')
}

export async function participating(page, account, logger){
    await page.waitForFunction(()=>document.readyState==='interactive')
    const button = await page.waitForSelector('.c-button.c-button--large')
    await button.click()
    logger('participant finished.')
}

export async function residence(page, account, logger){
    await page.waitForFunction(()=>document.readyState==='interactive')
    const regionCode = account.ipRegion.toUpperCase()
    await page.evaluate(`document.querySelector('select#forms_offerings_participants_residence_residence_country').value = '${regionCode}'`)
    if(regionCode === 'UA'){
        await page.evaluate(`document.querySelector('div.js-state_ukraine select').value = 'Kyïv'`)
    }
    await page.evaluate(`document.querySelector('.c-input--checkbox').checked = true`)
    const button = await page.waitForSelector('.c-button.c-button--large')
    await button.click()
    logger('resident region finished.')
}
export async function quiz(page, account, logger){
    await page.waitForFunction(()=>document.readyState==='interactive')
    logger(JSON.stringify(account, null, 2))
    if(page.url().includes("neon")){
        await page.evaluate(`var answerArray = ["50,000,000","Users in the waiting room for the sale","Neon is an EVM","USDC","$0.10","The user's purchase may be canceled","CoinList.co","The user's account will be terminated"];`)
    }else if(page.url().includes("archway")){
        await page.evaluate(`var answerArray = ["30,000,000","Users in the waiting room for the sale","Archway is a Cosmos-native","USDC","$0.20","The user's purchase may be canceled","CoinList.co","The user's account will be terminated"];`)
    }else{
        logger("quiz answer not found.")
        return
    }
    await page.evaluate(`$('div.s-marginBottom1').not('.s-marginTop1').find('.c-label').toArray().forEach(d => { if (answerArray.some(a => d.outerText.startsWith(a))) d.click() }); $('.c-button')[0].click();`)
    logger('quiz finished')
}
