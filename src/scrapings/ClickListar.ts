import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const ClickListar = async (page: Page, settings: ISettingsGoiania, newPagePromise: Promise<Page>): Promise<void> => {
    try {
        const frame = page.frames().find(frame => frame.name() === 'cpo')
        if (frame) {
            await frame.waitForSelector('[value=Listar]')
            await frame.click('[value=Listar]')
        } else {
            throw 'NOT_FOUND_FRAME_CPO'
        }
        const popup = await newPagePromise
        await page.goto(popup.url(), { waitUntil: 'networkidle0', timeout: 6000000 }) // aguarda até 60 minutos carregar a página pra fazer o download
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'ClickListar'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao clicar no botão de listar notas.'
        settings.pathFile = __filename

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}