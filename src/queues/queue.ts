import 'dotenv/config'
import { SaveDMSPDFJobs } from './jobs/SaveDMSPDF'
import { ScrapingNotesJob } from './jobs/ScrapingNotes'
import { saveDMSPDFLib } from './lib/SaveDMSPDF'
import { scrapingNotesLib } from './lib/ScrapingNotes'

saveDMSPDFLib.process(SaveDMSPDFJobs.handle)
scrapingNotesLib.process(ScrapingNotesJob.handle)