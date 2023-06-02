export async function retry(method, maxTime=5, ms=1000, failCb) {
    let retryCount = 0;

    while (retryCount < maxTime) {
        try {
            return await method(); // Return the result if the method succeeds
        } catch (error) {
            if(ms) await sleep(ms)
            retryCount++;
            console.log(`Retry ${retryCount} failed with error: ${error}`);
            await failCb?.()
        }
    }
    if(!failCb) throw new Error(`Exceeded maximum retry time of ${maxTime}`);
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export function runWithTimeout(method, timeout, throwError) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            if (throwError) {
                clearTimeout(timeoutId);
                reject(new Error('Timeout exceeded'));
            } else {
                resolve();
            }
        }, timeout);

        method()
            .then(result => {
                clearTimeout(timeoutId);
                resolve(result);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                reject(error);
            });
    });
}
