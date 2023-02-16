import Queue from 'bull'

import { logger } from '@common/log'
import redisConfig from '@config/redis'
import { ILogNotaFiscalApi, ISettingsGoiania } from '@scrapings/_interfaces'
import { SaveLogPrefGoiania } from '@services/SaveLogPrefGoiania'

import { SaveDMSPDFJobs } from '../jobs/SaveDMSPDF'

export const saveDMSPDFLib = new Queue(SaveDMSPDFJobs.key, { redis: redisConfig })

saveDMSPDFLib.on('failed', async (job, error) => {
    const settings: ISettingsGoiania = job.data.settings
    const dataToSave: ILogNotaFiscalApi = {
        idLogNfsPrefGynDms: settings.idLogNfsPrefGynDms,
        idAccessPortals: settings.idAccessPortals,
        idCompanie: settings.idCompanie,
        typeLog: 'error',
        messageLog: 'ErrorToProcessDataInQueue',
        messageError: error.message?.toString(),
        messageLogToShowUser: 'Erro ao salvar XMLs na pasta.',
        federalRegistration: settings.federalRegistration,
        nameCompanie: settings.nameCompanie,
        cityRegistration: settings.cityRegistration,
        dateStartDown: new Date(settings.dateStartDown).toISOString(),
        dateEndDown: new Date(settings.dateEndDown).toISOString(),
        qtdNotesDown: settings.qtdNotes || 0,
        qtdTimesReprocessed: settings.qtdTimesReprocessed || 0,
        urlPrintLog: settings.urlPrintLog || '',
        urlFileDms: settings.urlFileDms || ''
    }

    const saveLog = new SaveLogPrefGoiania(dataToSave)
    const idLogNfsPrefGynDms = await saveLog.save()

    logger.error(`[SaveDMSPDF-FAILED] ID ${idLogNfsPrefGynDms} | ${settings.codeCompanieAccountSystem} | ${settings.nameCompanie} | ${settings.federalRegistration} | ${settings.dateStartDown} - ${settings.dateEndDown}`)
    logger.error(error)
})

saveDMSPDFLib.on('completed', async (job) => {
    const settings: ISettingsGoiania = job.data.settings
    const dataToSave: ILogNotaFiscalApi = {
        idLogNfsPrefGynDms: settings.idLogNfsPrefGynDms,
        idAccessPortals: settings.idAccessPortals,
        idCompanie: settings.idCompanie,
        typeLog: 'success',
        messageLog: 'SucessToSaveNotes',
        messageLogToShowUser: 'Notas salvas com sucesso',
        messageError: '',
        federalRegistration: settings.federalRegistration,
        nameCompanie: settings.nameCompanie,
        cityRegistration: settings.cityRegistration,
        dateStartDown: new Date(settings.dateStartDown).toISOString(),
        dateEndDown: new Date(settings.dateEndDown).toISOString(),
        qtdNotesDown: settings.qtdNotes || 0,
        qtdTimesReprocessed: settings.qtdTimesReprocessed || 0,
        urlPrintLog: settings.urlPrintLog || '',
        urlFileDms: settings.urlFileDms || ''
    }

    const saveLog = new SaveLogPrefGoiania(dataToSave)
    const idLogNfsPrefGynDms = await saveLog.save()

    logger.info(`[SaveDMSPDF-SUCCESS] ID ${idLogNfsPrefGynDms} | ${settings.codeCompanieAccountSystem} | ${settings.nameCompanie} | ${settings.federalRegistration} | ${settings.dateStartDown} - ${settings.dateEndDown}`)
})