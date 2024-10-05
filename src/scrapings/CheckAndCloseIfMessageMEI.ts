import { Page } from 'puppeteer'

export const CheckAndCloseIfMessageMEI = async (page: Page, timeout = 15000): Promise<Boolean> => {
    try {
        const responseWaitPromise = page.waitForResponse(resp => resp.url().toUpperCase().indexOf('POPUP_MEI') >= 0 && resp.status() === 200, { timeout })
        await page.waitForTimeout(2000)
        const frame = page.frames().find(frame => frame.url().toUpperCase().indexOf('POPUP_MEI') >= 0)
        if (frame) {
            await frame.waitForSelector('input[id*="block_wtMainContent"]', { timeout: 15000 })
            await frame.click('input[id*="block_wtMainContent"]')
        }
        await responseWaitPromise
        if (frame) return true
        else return false
    } catch (error) {
        console.log(error)
        console.log('error find frame popup')
        return false
    }
}