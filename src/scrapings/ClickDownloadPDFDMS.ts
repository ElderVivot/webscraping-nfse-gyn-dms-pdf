import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { checkIfLoadedThePage } from './CheckIfLoadedThePage'
import { TreatsMessageLog } from './TreatsMessageLog'

export const ClickDownloadPDFDMS = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await checkIfLoadedThePage(page, 'cpo', true)
        const frame = page.frames().find(frame => frame.name() === 'cpo')
        if (frame) {
            await frame.waitForTimeout(1500)
            const downloadIsEnable = await frame.$("tr td font a[href*='snfse00500f0']")
            if (downloadIsEnable) await frame.click("tr td font a[href*='snfse00500f0']")
            else throw 'BUTTON_TO_ISSUE_NF_DONT_VISIBLE'
        } else {
            throw 'NOT_FOUND_FRAME_CPO'
        }
    } catch (error) {
        settings.typeLog = 'error'
        settings.messageLog = 'ClickDownloadPDFDMS'
        settings.messageError = error
        settings.messageLogToShowUser = 'Erro ao clicar no botão "Download de XML de Notas Fiscais por período".'
        settings.pathFile = __filename
        if (error === 'BUTTON_TO_DOWNLOAD_XMLS_IS_NOT_ENABLE') {
            settings.typeLog = 'warning'
            settings.messageLogToShowUser = 'Opção de emitir as notas está desabilitada'
        }

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}