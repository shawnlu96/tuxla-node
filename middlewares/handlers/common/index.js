import freeze from "../../../utils/freeze.js";

export async function addHCaptchaEventHandler(page, logger){
    // will only run once in 120s
    const handleHCaptcha = freeze(async () => {
        await page.solveRecaptchas()
        logger(`HCaptcha resolve task sent`)
    }, 2000);

    page.on("request", async (request) => {
        const url = await request.url();
        if (url.includes("https://hcaptcha.com/getcaptcha")) {
            logger("hCaptcha request found.")
            try {
                await handleHCaptcha()
            } catch (e) {
                console.error(e.message)
            }
        }
        request.continue()
    });
}

export async function addRecaptchaEventHandler(page, logger){

}

