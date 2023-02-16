import { IDateAdapter } from '@common/adapters/date/date-adapter'
import { makeDateImplementation } from '@common/adapters/date/date-factory'
import { logger } from '@common/log'

const DAY_PROCESS_DOWNOAD = process.env.DAY_PROCESS_DOWNOAD || 1

const getDateStart = (dateFactory: IDateAdapter): Date => {
    const dateStart = dateFactory.subMonths(new Date(), Number(process.env.RETROACTIVE_MONTHS_TO_DOWNLOAD) || 0)
    dateStart.setDate(1)
    return dateStart
}

const getDateEnd = (): Date => {
    const today = new Date()
    const dayToday = today.getDate()

    // example -> if DAY_PROCESS_DOWNOAD = 2, then when day 2 or greather get date last month. Else day 1 get two months ago
    if (dayToday >= DAY_PROCESS_DOWNOAD) {
        return new Date(today.getFullYear(), today.getMonth(), 0)
    } else {
        return new Date(today.getFullYear(), today.getMonth() - 1, 0)
    }
}

export async function PeriodToDownNotesGoiania (): Promise<{dateStart: Date, dateEnd: Date}> {
    const dateFactory = makeDateImplementation()
    try {
        const dateStart = getDateStart(dateFactory)
        const dateEnd = getDateEnd()

        if (dateStart >= dateEnd) {
            logger.info(`DONT PROCESS NOW BECAUSE DAY START ${dateStart.toISOString()} AND DAY END ${dateEnd.toISOString()}`)
            throw 'DONT_HAVE_NEW_PERIOD_TO_PROCESS'
        }

        return {
            dateStart, dateEnd
        }
    } catch (error) {

    }
}