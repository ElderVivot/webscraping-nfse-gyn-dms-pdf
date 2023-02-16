import { ISettingsGoiania } from '@scrapings/_interfaces'
import { MainProcessLoguin } from '@scrapings/MainProcessLoguin'

interface IData {
    data: {
        settings: ISettingsGoiania
    }
}

const ScrapingNotesJob = {
    key: 'ScrapingNotesPrefGynDms',
    async handle ({ data }: IData): Promise<void> {
        const settings = data.settings

        await MainProcessLoguin({
            ...settings
        })

        return Promise.resolve()
    }
}

export { ScrapingNotesJob }