import puppeteer, { Page } from 'puppeteer'
import 'dotenv/config'

import { logger } from '@common/log'
import { cleanDataObject } from '@utils/clean-data-object'

import { ISettingsGoiania } from './_interfaces'
import { AlertSimplesNacional } from './AlertSimplesNacional'
import { ChangeCompanie } from './ChangeCompanie'
import { CheckAndCloseIfExistPopupWarning } from './CheckAndCloseIfExistPopupWarning'
import { CheckIfAvisoFrameMnuAfterEntrar } from './CheckIfAvisoFrameMnuAfterEntrar'
import { CheckIfCompanieIsValid } from './CheckIfCompanieIsValid'
import { CheckIfEmpresaEstaBaixada } from './CheckIfEmpresaEstaBaixada'
import { CheckIfExistNoteInPeriod } from './CheckIfExistNoteInPeriod'
import { CheckIfPeriodAlreadyProcessed } from './CheckIfPeriodAlreadyProcessed'
import { CheckIfSelectLoaded } from './CheckIfSelectLoaded'
import { ClickDownloadPDFDMS } from './ClickDownloadPDFDMS'
import { ClickListar } from './ClickListar'
import { ClickNFeEletronica } from './ClickNFeEletronica'
import { ClickPortalContribuinte } from './ClickPortalContribuinte'
import { CloseOnePage } from './CloseOnePage'
import { GetBufferDataNotes } from './GetBufferDataNotes'
import { GetCNPJPrestador } from './GetCNPJPrestador'
import { GetOptionsEmpresas } from './GetOptionsEmpresas'
import { GotoLinkNFeEletrotinaEntrar } from './GotoLinkNFeEletrotinaEntrar'
import { Loguin } from './Loguin'
import { OpenCompanieInNewPage } from './OpenCompanieInNewPage'
import { OpenSiteGoiania } from './OpenSiteGoiania'
import { SelectPeriodToDownload } from './SelectPeriodToDownload'

// const HEADLESS = process.env.HEADLESS || 'YES' // nao funciona pra salvar o pdf o headless como false

export const MainProcessLoguin = async (settings: ISettingsGoiania): Promise<void> => {
    settings.loguin = settings.loguin.replace(/[^0-9]/g, '')
    settings.month = new Date(settings.dateStartDown).getMonth() + 1
    settings.year = new Date(settings.dateStartDown).getFullYear()

    const { cityRegistration, federalRegistration } = settings

    try {
        logger.info(`0 - Abrindo loguin ${settings.loguin}`)
        const browser = await puppeteer.launch({ headless: true, slowMo: 50, args: ['--start-maximized'] })
        const page = await browser.newPage()
        await page.setViewport({ width: 0, height: 0 })

        logger.info('1 - Abrindo site da prefeitura')
        await OpenSiteGoiania(page, browser, settings)

        logger.info('2 - Realizando o loguin')
        await Loguin(page, browser, settings)

        logger.info('3 - Clicando no botão "Portal Contruinte"')
        await ClickPortalContribuinte(page, browser, settings)

        logger.info('4 - Pegando a relação de empresas que este contribuinte possui.')
        const optionsEmpresas = await GetOptionsEmpresas(page, browser, settings)

        // Pega a URL atual pra não ter que abrir do zero o processo
        const urlActual = page.url()

        // Percorre o array de empresas
        for (const option of optionsEmpresas) {
            if (cityRegistration) if (option.inscricaoMunicipal !== settings.cityRegistration) continue

            logger.info(`5 - Iniciando processamento da empresa ${option.label} - ${option.inscricaoMunicipal}`)

            if (!federalRegistration) {
                settings = cleanDataObject(settings, [], ['idLogNfsPrefGynDms', 'idAccessPortals', 'loguin', 'password', 'typeProcessing', 'dateStartDown', 'dateEndDown', 'month', 'year', 'nameStep'])
            }

            // set new values
            settings.valueLabelSite = option.value
            settings.nameCompanie = option.label
            settings.cityRegistration = option.inscricaoMunicipal

            try {
                settings = await CheckIfCompanieIsValid(page, settings)

                if (!settings.idLogNfsPrefGynDms) await CheckIfPeriodAlreadyProcessed(page, settings)

                const pageEmpresa = await browser.newPage()
                await pageEmpresa.setViewport({ width: 0, height: 0 })
                await OpenCompanieInNewPage(pageEmpresa, settings, urlActual)

                logger.info('6 - Realizando a troca pra empresa atual')
                await ChangeCompanie(pageEmpresa, settings)

                logger.info('7 - Checando se a troca foi realizada com sucesso')
                await CheckIfSelectLoaded(pageEmpresa, settings)

                logger.info('8 - Verificando se o "Contribuinte está com a situação Baixada/Suspensa"')
                await CheckIfEmpresaEstaBaixada(pageEmpresa, settings)

                logger.info('9 - Verificando se tem aviso pro contribuinte, caso sim, fechando-o')
                await CheckAndCloseIfExistPopupWarning(pageEmpresa)

                logger.info('10 - Clicando no botão "NF-e Eletrônica"')
                await ClickNFeEletronica(pageEmpresa, settings)

                logger.info('11 - Clicando no botão "Entrar"')
                await GotoLinkNFeEletrotinaEntrar(pageEmpresa, settings)

                // Aviso depois do botão "Entrar" --> caso tenha aviso para o processamento desta
                // empresa, pois geralmente quando tem é empresa sem atividade de serviço ou usuário inválido
                logger.info('12 - Checando se tem aviso após botão "Entrar"')
                await CheckIfAvisoFrameMnuAfterEntrar(pageEmpresa, settings)

                logger.info('13 - Passando pelo alerta do simples nacional.')
                await AlertSimplesNacional(pageEmpresa, settings)

                logger.info('14 - Clicando no botão "Emite Relatório de Notas Fiscais"')
                await ClickDownloadPDFDMS(pageEmpresa, settings)

                logger.info('15 - Pegando o CNPJ/CPF do Prestador')
                settings.federalRegistration = await GetCNPJPrestador(pageEmpresa, settings)

                settings = await CheckIfCompanieIsValid(pageEmpresa, settings)

                logger.info('16 - Seleciona o período desejado pra baixar o PDF')
                await SelectPeriodToDownload(pageEmpresa, settings)

                logger.info('17 - Clicando no botão "Listar"')
                const newPagePromise: Promise<Page> = new Promise(resolve => (
                    browser.once('targetcreated', target => resolve(target.page()))
                ))
                await ClickListar(pageEmpresa, settings, newPagePromise)

                // Verifica se tem notas no período solicitado, caso não, para o processamento
                logger.info('18 - Checando se existe nota no período')
                await CheckIfExistNoteInPeriod(pageEmpresa, settings)

                logger.info('19 - Pegando o buffer do PDF pra salvar as notas')
                await GetBufferDataNotes(pageEmpresa, settings)

                // Fecha a aba do mês afim de que possa abrir outra
                await CloseOnePage(pageEmpresa, 'Empresa')
            } catch (error) {
                if (error.toString().indexOf('TreatsMessageLog') < 0) {
                    logger.error(error)
                }
            }
        }

        logger.info('[Final-Loguin] - Todos os dados deste loguin processados, fechando navegador.')
        // if (browser) await browser.close()
    } catch (error) {
        logger.error(error)
    }
}

// MainProcessLoguin({
//     loguin: '03807159100',
//     password: 'soma@123',
//     idAccessPortals: '78682b66-280b-4bfa-a07c-b8006f9b45e9',
//     typeProcessing: 'MainAddQueueLoguin',
//     dateStartDown: '2023-01-01 03:00',
//     dateEndDown: '2023-01-31 03:00',
//     cityRegistration: '2897202'
// }).then(_ => console.log(_))