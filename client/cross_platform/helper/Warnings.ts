export type WarningType = "general";
export type WarningInformationType = IGeneralWarning;

export interface IWarningSubmission {
    type: WarningType;
    location: {
        lat: number,
        long: number,
    };
    dateTime: string;
    information: WarningInformationType;
}

export interface IWarning {
    warningId: string;
    warningType: WarningType;
    warningDateTime: string;
    latitude: number;
    longitude: number;
}

export interface IGeneralWarning {
    peopleDescription: string;
    warningDescription: string;
}
