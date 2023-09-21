import 'dotenv/config'

import { makeDateImplementation } from '@common/adapters/date/date-factory'
import { makeFetchImplementation } from '@common/adapters/fetch/fetch-factory'
import { logger } from '@common/log'
import { scrapingNotesLib } from '@queues/lib/ScrapingNotes'
import { returnMonthsOfYear } from '@utils/functions'

import { IAccessPortals } from './_interfaces'
import { urlBaseApi } from './_urlBaseApi'
import { PeriodToDownNotesGoiania } from './PeriodToDownNotesGoiania'

async function addScrapingToQueue (idAccessPortals: string, loguin: string, password: string, dateStart: Date, dateEnd: Date): Promise<void> {
    // if today < dateEnd dont process now
    if (new Date() < dateEnd) return null

    const dateFactory = makeDateImplementation()

    const jobId = `${idAccessPortals}_${dateFactory.formatDate(dateStart, 'yyyyMMdd')}_${dateFactory.formatDate(dateEnd, 'yyyyMMdd')}`
    const job = await scrapingNotesLib.getJob(jobId)
    if (job?.finishedOn) await job.remove() // remove job if already fineshed to process again, if dont fineshed yet, so dont process

    await scrapingNotesLib.add({
        settings: {
            idAccessPortals,
            loguin,
            password,
            typeProcessing: 'MainAddQueueLoguin',
            dateStartDown: dateStart,
            dateEndDown: dateEnd
        }
    }, {
        jobId
    })

    logger.info(`- Adicionado na fila JOB ID ${jobId} do loguin ${loguin}`)
}

export class Applicattion {
    constructor () { }

    async process (): Promise<void> {
        const fetchFactory = makeFetchImplementation()

        const urlBase = `${urlBaseApi}/access_portals`
        const urlFilter = '?status=ACTIVE&getPaswordIncorrect=no&idTypeAccessPortals=6a009e00-47b0-4e45-a28f-87a3481b2060'
        const response = await fetchFactory.get<IAccessPortals[]>(`${urlBase}${urlFilter}`, { headers: { tenant: process.env.TENANT } })
        if (response.status >= 400) throw response
        const allAccess = response.data

        for (const access of allAccess) {
            try {
                const urlFilter = `/${access.idAccessPortals}/show_with_decrypt_password`
                const response = await fetchFactory.get<IAccessPortals>(`${urlBase}${urlFilter}`, { headers: { tenant: process.env.TENANT } })
                if (response.status >= 400) throw response

                const { login, passwordDecrypt, idAccessPortals } = response.data

                const periodToDown = await PeriodToDownNotesGoiania()

                let year = periodToDown.dateStart.getFullYear()
                const yearInicial = year
                const monthInicial = periodToDown.dateStart.getMonth() + 1

                const yearFinal = periodToDown.dateEnd.getFullYear()
                const monthFinal = periodToDown.dateEnd.getMonth() + 1

                while (year <= yearFinal) {
                    const months = returnMonthsOfYear(year, monthInicial, yearInicial, monthFinal, yearFinal)
                    for (const month of months) {
                        const monthSubOne = month - 1
                        await addScrapingToQueue(idAccessPortals, login, passwordDecrypt, new Date(year, monthSubOne, 1), new Date(year, monthSubOne + 1, 0))
                    }

                    year++
                }
            } catch (error) {
                logger.error(error)
            }
        }
    }
}

// const applicattion = new Applicattion()
// applicattion.process().then(_ => console.log(_))