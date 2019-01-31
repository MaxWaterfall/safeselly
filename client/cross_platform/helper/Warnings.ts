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
    WarningId: string;
    WarningType: WarningType;
    WarningDateTime: string;
    Latitude: number;
    Longitude: number;
}

export interface IGeneralWarning {
    PeopleDescription: string;
    WarningDescription: string;
}
