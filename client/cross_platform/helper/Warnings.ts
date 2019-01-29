type WarningType = "general";

export interface IWarning {
    WarningId: string;
    WarningType: WarningType;
    WarningDateTime: string;
    Latitude: number;
    Longitude: number;
}

export interface IGeneralWarning {
    peopleDescription: string;
    warningDescription: string;
}
