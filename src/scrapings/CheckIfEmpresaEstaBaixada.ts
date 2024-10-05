import { Page } from 'puppeteer'

import { ISettingsGoiania } from './_interfaces'
import { TreatsMessageLog } from './TreatsMessageLog'

export const CheckIfEmpresaEstaBaixada = async (page: Page, settings: ISettingsGoiania): Promise<void> => {
    try {
        await page.waitForTimeout(3000)
        try {
            const selector = 'div[id*="GoianiaTheme_wtTelaPrincipal_block_wtMainContent_WebPatterns_wt"]' && 'div[id*="_block_wtContent1_wtLinks"] > div:nth-child(1)'
            let aviso: string = await page.$eval(selector, element => element.textContent)
            aviso = aviso ? aviso.normalize('NFD').replace(/[^a-zA-Z/ ]/g, '').toUpperCase() : ''
            if (aviso.indexOf('SITUACAO BAIXA') >= 0 || aviso.indexOf('SITUACAO SUSPENSAO') >= 0) {
                throw 'BAIXADA_SUSPENSA'
            }
        } catch (error) {
            const selector = 'div[id*="_block_wtMainContent_wtMensagemParaLogarCertificado"] > label'
            let aviso: string = await page.$eval(selector, element => element.textContent)
            aviso = aviso ? aviso.normalize('NFD').replace(/[^a-zA-Z/ ]/g, '').toUpperCase() : ''

            const selectorNfeEletronica = 'span[id*="GoianiaTheme_wtTelaPrincipal_block_wtMainContent_WebPatterns_wt"]' && 'span[id*="_block_wtText_wtNFEletronica"]'
            const resultNfeEletronica = await page.$(selectorNfeEletronica)

            if (aviso.indexOf('AUTENTICAR COM CERTIFICADO') >= 0 && !resultNfeEletronica) {
                throw 'AUTENTICAR_CERTIFICADO'
            }
        }
    } catch (error) {
        settings.typeLog = 'error'
        if (error === 'BAIXADA_SUSPENSA') {
            settings.typeLog = 'warning'
            settings.messageLogToShowUser = 'Empresa com a situação "Baixada/Suspensa" na prefeitura.'
        } else if (error === 'AUTENTICAR_CERTIFICADO') {
            settings.typeLog = 'warning'
            settings.messageLogToShowUser = 'Botão NF-e Eletrônica desabilitado.'
        } else {
            settings.messageLogToShowUser = 'Erro ao checar o status da empresa na prefeitura.'
        }
        settings.messageLog = 'CheckIfEmpresaEstaBaixada'
        settings.messageError = error
        settings.pathFile = __filename

        const treatsMessageLog = new TreatsMessageLog(page, settings)
        await treatsMessageLog.saveLog()
    }
}