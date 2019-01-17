export interface IWarning {
    WarningId: number;
    WarningDateTime: string;
    WarningDescription: string;
    Latitude: number;
    Longitude: number;
    // TODO: Change these two to numbers.
    Upvotes: any;
    Downvotes: any;
}
