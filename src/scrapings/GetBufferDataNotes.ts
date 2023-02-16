import { Page } from 'puppeteer'

import { saveDMSPDFLib } from '@queues/lib/SaveDMSPDF'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const GetBufferDataNotes = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        const buffer = await page.pdf({
            format: 'a4',
            printBackground: false
        })
        await saveDMSPDFLib.add({ settings, bufferPDF: buffer })
    } catch (error) {
        console.log(error)
        settings.typeLog = 'error'
        settings.messageLog = 'GetBufferDataNotes'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao pegar dados pra salvar PDF'
        settings.pathFile = __filename

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}