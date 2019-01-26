export interface IWarning {
    WarningId: number;
    WarningType: "general";
    WarningDateTime: string;
    Latitude: number;
    Longitude: number;
}

export interface IGeneralWarning {
    peopleDescription: string;
    warningDescription: string;
}
