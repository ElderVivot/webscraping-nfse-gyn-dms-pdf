import { Page } from 'puppeteer'

import { IFetchAdapter } from '@common/adapters/fetch/fetch-adapter'
import { makeFetchImplementation } from '@common/adapters/fetch/fetch-factory'
import { AwsS3, s3Factory } from '@common/aws/s3/s3'
import { handlesFetchError } from '@common/error/fetchError'
// import { logger } from '@common/log'
import { logger } from '@common/log'
import { ILogNotaFiscalApi } from '@scrapings/_interfaces'
import { urlBaseApi } from '@scrapings/_urlBaseApi'

export class SaveLogPrefGoiania {
    private fetchFactory: IFetchAdapter
    private urlBase: string
    private s3: AwsS3

    constructor (private dataToSave: ILogNotaFiscalApi, private saveScreenshot = false, private page: Page = null) {
        this.dataToSave = dataToSave
        this.saveScreenshot = saveScreenshot
        this.page = page
        this.fetchFactory = makeFetchImplementation()
        this.urlBase = `${urlBaseApi}/log_nfs_pref_gyn_dms`
        this.s3 = s3Factory()
    }

    private async getScreenshot (): Promise<string> {
        if (this.saveScreenshot) {
            const screenshot = await this.page.screenshot({ encoding: 'base64', type: 'png', fullPage: true })

            const resultUpload = await this.s3.upload(screenshot, `${process.env.TENANT}/nfs-gyn-dms-print`, 'png', 'image/png', 'bayhero-aeron')
            return resultUpload.Location
        }
        return ''
    }

    async save (): Promise<string> {
        try {
            if (this.dataToSave.idLogNfsPrefGynDms) {
                const urlPrint = await this.getScreenshot()
                this.dataToSave.urlPrintLog = urlPrint

                const response = await this.fetchFactory.put<ILogNotaFiscalApi>(
                    `${this.urlBase}/${this.dataToSave.idLogNfsPrefGynDms}`,
                    { ...this.dataToSave },
                    { headers: { tenant: process.env.TENANT } }
                )
                if (response.status >= 400) throw response

                return response.data.idLogNfsPrefGynDms
            } else {
                const urlPrint = await this.getScreenshot()
                this.dataToSave.urlPrintLog = urlPrint

                const response = await this.fetchFactory.post<ILogNotaFiscalApi>(
                    `${this.urlBase}`,
                    { ...this.dataToSave },
                    { headers: { tenant: process.env.TENANT } }
                )
                if (response.status >= 400) throw response

                return response.data.idLogNfsPrefGynDms
            }
        } catch (error) {
            const responseFetch = handlesFetchError(error)
            if (responseFetch) logger.error(responseFetch)
            else logger.error(error)
        }
    }
}