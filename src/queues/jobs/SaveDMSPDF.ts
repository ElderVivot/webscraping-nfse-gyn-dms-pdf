import 'dotenv/config'
import { promises as fsPromises } from 'fs'
import path from 'path'

import { s3Factory } from '@common/aws/s3/s3'
import { logger } from '@common/log'
import { ISettingsGoiania } from '@scrapings/_interfaces'
import createFolderToSaveData from '@utils/CreateFolderToSaveData'

interface IData {
    data: {
        settings: ISettingsGoiania
        bufferPDF: Buffer
    }
}

export const SaveDMSPDFJobs = {
    key: 'SaveDMSPDF',
    async handle ({ data: { settings, bufferPDF } }: IData): Promise<void> {
        const s3 = s3Factory()

        const pathSaveData = createFolderToSaveData(settings)
        const buffer = Buffer.from(bufferPDF)

        await fsPromises.writeFile(path.resolve(pathSaveData, `${settings.codeCompanieAccountSystem}-${settings.nameCompanie.substring(0, 60)}`), buffer)

        const resultUpload = await s3.upload(buffer, `${process.env.TENANT}/nfs-gyn-dms`, 'pdf', 'application/pdf', 'bayhero-aeron')
        if (settings.urlFileDms) await s3.delete(settings.urlFileDms, 'bayhero-aeron')
        settings.urlFileDms = resultUpload.Location

        logger.info('---------------------------------------------------')
        logger.info(`[SaveDMSPDF-PROCESSING] | ${settings.codeCompanieAccountSystem} | ${settings.nameCompanie} | ${settings.federalRegistration} | ${settings.cityRegistration} | ${settings.month}/${settings.year}`)
        logger.info('---------------------------------------------------')
    }
}