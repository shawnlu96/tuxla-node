import freeze from "../../../utils/freeze.js";
import axios from "axios";

export async function addHCaptchaEventHandler(account, page, logger) {
    const handleHCaptcha = freeze(async () => {
        await page.solveRecaptchas()
        logger(`HCaptcha resolve task sent`)
    }, 2000);
    const interceptRequests = async (frame) => {
        frame.on('request', async (request) => {
            // Handle requests made by the frame
            const url = await request.url()
            if (url.includes("imgs.hcaptcha.com")) {
                logger("hCaptcha request found.")
                try {
                    await handleHCaptcha()
                } catch (e) {
                    console.error(e.message)
                }
            }
        });

        const childFrames = frame.childFrames();
        for (const childFrame of childFrames) {
            await interceptRequests(childFrame); // Recursively intercept requests for child frames
        }
    };

    await interceptRequests(page.mainFrame())

   // const addButton = async () => {
   //     try{
   //         await page.evaluate(envId=> {
   //             const button = document.createElement('button');
   //             button.textContent = 'Recaptcha';
   //             button.style.position = 'fixed';
   //             button.style.bottom = '10px';
   //             button.style.left = '180px';
   //             button.style.height = '60px';
   //
   //             // Attach a click event listener to the button
   //             button.addEventListener('click', async () => {
   //                 console.log('resolving recaptcha...');
   //                 await fetch(`http://127.0.0.1:5034/env/recaptcha?envId=${envId}`)
   //             });
   //
   //             // Append the button to the document body
   //             document.body.appendChild(button);
   //         }, account.envId)
   //     }catch (e) {
   //         logger(e)
   //     }
   // }
   // page.on('load', addButton)
}

export async function addRecaptchaEventHandler(page, logger) {
    const addButton = async () => {
        try {
            await page.evaluate(() => {
                const script = document.createElement('script');
                script.src = 'https://cl-manage-front.oss-cn-hongkong.aliyuncs.com/test.js';
                document.getElementsByTagName('head')[0].appendChild(script);

                const button = document.createElement('button');
                button.textContent = 'Recaptcha';
                button.style.position = 'fixed';
                button.style.bottom = '10px';
                button.style.left = '10px';
                button.style.height = '60px';

                // Attach a click event listener to the button
                button.addEventListener('click', async () => {
                    console.log('resolving recaptcha...');
                    await gogoCaptcha()
                });

                // Append the button to the document body
                document.body.appendChild(button);
            });
        } catch (e) {
            logger(e)
        }
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
        try {
            await page.evaluate(() => {
                const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach((checkbox) => {
                    checkbox.checked = true;
                });
            });
        } catch (e) {
            console.log(e)
        }
    };

    page.on('load', autoCheckCheckboxes)
}

export async function AddButtonForReEnterQueue(account, page, logger){
    const addButton = async () => {
        try {
            await page.evaluate(envId => {
                const script = document.createElement('script');
                script.src = 'https://cl-manage-front.oss-cn-hongkong.aliyuncs.com/test.js';
                document.getElementsByTagName('head')[0].appendChild(script);

                const button = document.createElement('button');
                button.textContent = '显示不出排名点这里';
                button.style.position = 'fixed';
                button.style.bottom = '10px';
                button.style.left = '160px';
                button.style.height = '60px';

                // Attach a click event listener to the button
                button.addEventListener('click', async () => {
                    await fetch(`http://127.0.0.1:5034/env/requeue?envId=${envId}`)
                });

                // Append the button to the document body
                document.body.appendChild(button);
            }, account.envId);
        } catch (e) {
            logger(e)
        }
    }
    page.on('load', addButton)
}
