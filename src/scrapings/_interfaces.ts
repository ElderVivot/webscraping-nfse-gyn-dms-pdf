export type TTypeLog = 'success' | 'error' | 'warning'
export enum ETypeFederalRegistration {cnpj = 'cnpj', cpf = 'cpf', cei = 'cei', caepf = 'caepf', foreign = 'foreign'}
export enum ECompanieStatus {ACTIVE = 'ACTIVE', INACTIVE = 'INACTIVE'}
export type TTypeStatusAccess = 'ACTIVE' | 'INACTIVE'

export interface ISettingsGoiania {
    idLogNfsPrefGynDms?: string
    idAccessPortals?: string
    idCompanie?: string
    loguin?: string
    password?: string
    typeProcessing?: 'MainAddQueueLoguin' | 'MainAddQueuCompanie'
    dateStartDown?: Date | string
    dateEndDown?: Date | string
    typeLog?: TTypeLog
    codeCompanieAccountSystem?: string
    nameCompanie?: string
    federalRegistration?: string
    cityRegistration?: string
    year?: number
    month?: number
    messageError?: string
    messageLog?: string
    messageLogToShowUser?: string
    error?: string
    valueLabelSite?: string
    qtdNotes?: number
    qtdTimesReprocessed?: number
    pathFile?: string
    nameStep?: string
    errorResponseApi?: any
    urlPrintLog?: string
    urlFileDms?: string
    bufferPDF?: Buffer | any
}

export interface ILogNotaFiscalApi {
    idLogNfsPrefGynDms: string
    idAccessPortals: string
    login?: string
    password?: string
    idCompanie?: string
    federalRegistration?: string
    cityRegistration: string
    nameCompanie: string
    dateStartDown:string
    dateEndDown:string
    typeLog: TTypeLog
    messageLog: string
    messageLogToShowUser: string
    messageError: string
    qtdNotesDown: number
    qtdTimesReprocessed: number
    urlPrintLog: string
    urlFileDms: string
}

export interface IAccessPortals {
    idAccessPortals: string
    idTypeAccessPortals: string
    nameAccess: string
    login: string
    password: string
    status: TTypeStatusAccess
    passwordDecrypt?: string
}

export interface ICompanies {
    idCompanie: string
    createdAt: Date
    updatedAt: Date
    codeCompanieAccountSystem: string
    name: string
    nickName: string
    typeFederalRegistration: ETypeFederalRegistration
    federalRegistration: string
    stateRegistration: string
    cityRegistration: string
    status: ECompanieStatus
    dddPhone: number
    phone: string
    email: string
    neighborhood: string
    street: string
    zipCode: string
    complement: string
    referency: string
    dateInicialAsCompanie: Date
    dateInicialAsClient: Date
    dateFinalAsClient: Date
    cnaes: string
    taxRegime: '01' | '02' | '03' | '99'
    idCity: number,
    stateCity: string,
    nameCity: string
}