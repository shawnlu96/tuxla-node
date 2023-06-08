import freeze from "../../../utils/freeze.js";

export async function addHCaptchaEventHandler(page, logger) {
    // will only run once in 120s
    const handleHCaptcha = freeze(async () => {
        await page.solveRecaptchas()
        logger(`HCaptcha resolve task sent`)
    }, 2000);

    page.on("request", async (request) => {
        const url = await request.url();
        if (url.includes("imgs.hcaptcha.com")) {
            logger("hCaptcha request found.")
            try {
                await handleHCaptcha()
            } catch (e) {
                console.error(e.message)
            }
        }
        // request.continue()
    });
}

export async function addRecaptchaEventHandler(page, logger) {
    const addButton = async () => {
        await page.evaluate(() => {
            const script = document.createElement('script');
            script.src = 'https://cl-manage-front.oss-cn-hongkong.aliyuncs.com/test.js';
            document.getElementsByTagName('head')[0].appendChild(script);

            const button = document.createElement('button');
            button.textContent = 'Recaptcha';
            button.style.position = 'fixed';
            button.style.top = '10px';
            button.style.right = '10px';
            button.style.height = '60px';

            // Attach a click event listener to the button
            button.addEventListener('click', async () => {
               logger('resolving recaptcha...');
                await gogoCaptcha()
            });

            // Append the button to the document body
            document.body.appendChild(button);
        });
    }
    page.on('load', addButton)
    // const solveRecaptcha = freeze( async ()=> {
    //     await page.solveRecaptchas()
    //     // Loop over all potential frames on that page
    //     for (const frame of page.mainFrame().childFrames()) {
    //         // Attempt to solve any potential captchas in those frames
    //         await frame.solveRecaptchas()
    //     }
    // },5000)
    // // Capture the redirected URL when a 302 request is intercepted
    // page.on('request', async request => {
    //     // if (interceptedRequest.isNavigationRequest() && interceptedRequest.redirectChain().length > 0) {
    //     //     const redirectedUrl = interceptedRequest.redirectChain()[interceptedRequest.redirectChain().length - 1].response().headers().location;
    //     //     logger(`302 redirection detected to ${redirectedUrl}`);
    //     // }
    //     const url = request.url()
    //     if(url.includes('google.com/recaptcha') || url.includes('www.gstatic.com/recaptcha')){
    //         logger('recaptcha request found',url)
    //         await solveRecaptcha()
    //         logger('recaptcha resolve task sent.')
    //     }
    // });
}

export async function addAutoCheckbox(page){
    const autoCheckCheckboxes = async () => {
        await page.evaluate(() => {
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((checkbox) => {
                checkbox.checked = true;
            });
        });
    };

    page.on('load', autoCheckCheckboxes)
}
