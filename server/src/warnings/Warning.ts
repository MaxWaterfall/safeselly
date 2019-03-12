// @ts-ignore No type definitions exist for this library.
import datetimeDifference from "datetime-difference";
import { isPointInCircle } from "geolib";
import { IWarning, Location } from "../../../shared/Warnings";
import * as log from "./../helper/Logger";
import { IUserInformation } from "./WarningHelper";

export abstract class Warning {
    protected static readonly HOUR = 60;
    protected static readonly HALF_DAY = Warning.HOUR * 12;
    /**
     * The distance this warning is from a location for it to receive +1 relevance.
     * This distance is in metres.
     */
    protected readonly UPPER_DISTANCE: number = 100;
    /**
     * The distance this warning is from a location for it to receive +2 relevance.
     * This distance is in metres.
     */
    protected readonly LOWER_DISTANCE: number = 50;
    /**
     * The initial relevance score for this user.
     * By default is 0. May be overridden by child classes.
     */
    protected readonly initialRelevance: number = 0;

    /**
     * The relevance score for this warning with this user.
     */
    protected relevance: number = 0;
    /**
     * The submitted warning.
     */
    protected warning: IWarning;
    /**
     * The information of the current user for which we are working out the warning relevance.
     */
    protected userInfo: IUserInformation | undefined;

    public constructor(warning: IWarning) {
        this.warning = warning;
    }

    /**
     * Calculates then returns the relevance of this warning.
     */
    public calculateRelevance(userInfo: IUserInformation): number {
        this.userInfo = userInfo;
        this.relevance = this.initialRelevance;

        // Start modification checks.
        this.locationCheck();
        this.timeCheck();
        this.ownsCheck();
        this.genderCheck();

        return this.relevance;
    }

    /**
     * Runs the LOCATION modification.
     * Updates the relevance based on the warnings location.
     */
    protected locationCheck() {
        // Check if this warning was near the users' last known location.
        if (this.userInfo!.lastKnownLocation !== undefined &&
            this.isLocationWithinLowerDistance(this.userInfo!.lastKnownLocation as Location)) {
            return;
        }

        // Check if this warning was near the users' home location.
        if (this.userInfo!.homeLocation !== undefined &&
            this.isLocationWithinLowerDistance(this.userInfo!.homeLocation as Location)) {
            return;
        }

        // Check if this warning was near the users' frequently visited locations.
        for (const location of this.userInfo!.frequentLocations!) {
            if (this.isLocationWithinLowerDistance(location)) {
                return;
            }
        }

        // Now do the same again for the upper locations.
        if (this.userInfo!.lastKnownLocation !== undefined &&
            this.isLocationWithinUpperDistance(this.userInfo!.lastKnownLocation as Location)) {
            return;
        }

        if (this.userInfo!.homeLocation !== undefined &&
            this.isLocationWithinUpperDistance(this.userInfo!.homeLocation as Location)) {
            return;
        }

        for (const location of this.userInfo!.frequentLocations!) {
            if (this.isLocationWithinUpperDistance(location)) {
                return;
            }
        }
    }

    /**
     * Checks whether the given location is within the LOWER distance (from the warning location).
     * Adds 2 to the relevance if so.
     * @param location
     */
    protected isLocationWithinLowerDistance(location: Location): boolean {
        if (isPointInCircle(
            {latitude: this.warning.location.lat, longitude: this.warning.location.long},
            {latitude: location.lat, longitude: location.long},
            this.LOWER_DISTANCE,
        )) {
            this.relevance += 2;
            return true;
        }

        return false;
    }

    /**
     * Checks whether the given location is within the UPPER distance (from the warning location).
     * Adds 1 to the relevance if so.
     * @param location
     */
    protected isLocationWithinUpperDistance(location: Location): boolean {
        if (isPointInCircle(
            {latitude: this.warning.location.lat, longitude: this.warning.location.long},
            {latitude: location.lat, longitude: location.long},
            this.UPPER_DISTANCE,
        )) {
            this.relevance += 1;
            return true;
        }

        return false;
    }

    /**
     * Runs the TIME modification.
     * Updates the relevance based on the warnings' time.
     */
    protected timeCheck() {
        const warningDate = new Date(Date.parse(this.warning.dateTime));
        const minutesFromNow = this.getMinutesFromNow(warningDate);
        if (minutesFromNow <= Warning.HOUR) {
            this.relevance += 2;
        } else if (minutesFromNow <= Warning.HALF_DAY) {
            this.relevance += 1;
        }
    }

    /**
     * Returns the amount of minutes that have passed from the given time.
     * Returns -1 if the date given is more than a month old.
     * @param date
     */
    protected getMinutesFromNow(date: Date) {
        const MINUTES_IN_HOUR = 60;
        const MINUTES_IN_DAY = MINUTES_IN_HOUR * 24;
        const now = new Date();
        const diff = datetimeDifference(date, now);

        if (diff.years > 0) {
            return -1;
        }

        if (diff.months > 0) {
            return -1;
        }

        let minutesPassed = 0;

        minutesPassed += diff.minutes;
        minutesPassed += diff.hours * MINUTES_IN_HOUR;
        minutesPassed += diff.days * MINUTES_IN_DAY;

        return minutesPassed;
    }

    /**
     * Runs the OWNS modification. Increases relevance if an item mentioned in the warning is owned by the user.
     * Left blank, should be overridden by child classes if needed.
     */
    protected ownsCheck(): void {
        return;
    }

    /**
     * Runs the GENDER modification. Tests whether an item mentioned in the warning is owned by the user.
     * Left blank, should be overridden by child classes if needed.
     */
    protected genderCheck(): void {
        return;
    }
}
