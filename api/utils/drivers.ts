import { Driver } from "../types/drivers.types";

export const areDriversDifferent = (
  drivers: Driver[] | null,
  scrapedDrivers: Driver[],
  propertiesToCheck: (keyof Driver)[]
): boolean => {
  if (!drivers || drivers.length !== scrapedDrivers.length) {
    return true;
  }

  return drivers.some((driver) => {
    const scrapedDriver = scrapedDrivers.find(
      (d) => d.firstName === driver.firstName && d.lastName === driver.lastName
    );

    if (!scrapedDriver) return true;

    return propertiesToCheck.some((property) => {
      if (property === "team") {
        return driver.team !== scrapedDriver.team;
      }
      return driver[property] !== scrapedDriver[property];
    });
  });
};
