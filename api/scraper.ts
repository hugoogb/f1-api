import * as cheerio from "cheerio";
import { Team } from "./types/teams.types";
import { TEAM_COLOR_MAPPING } from "./constants/teams.constants";
import { Driver } from "./types/drivers.types";

export const scrapeTeams = async (): Promise<Team[]> => {
  const url = "https://www.formula1.com/en/teams.html";

  try {
    const response = await fetch(url);
    const text = await response.text();
    const $ = cheerio.load(text);

    let teams: Team[] = [];

    const teamElements = $(
      "div.f1-container div.f1-inner-wrapper div.flex"
    ).children("a.group");

    for (let i = 0; i < teamElements.length; i++) {
      const teamElement = teamElements[i];

      let team: Team = {} as Team;
      team.id = i;

      team.name = $(teamElement).find("span.f1-heading__body").text().trim();

      const teamUrl = $(teamElement).attr("href");
      const fullTeamUrl = `https://www.formula1.com${teamUrl}`;

      const logoResponse = await fetch(fullTeamUrl);
      const logoText = await logoResponse.text();
      const $$ = cheerio.load(logoText);

      const logoElement = $$("div.f1-inner-wrapper figure.f1-driver-helmet");
      team.logo = logoElement.find("img").first().attr("src") || "";

      team.logoSmall =
        $(teamElement).find("img.f1-c-image").first().attr("src") || "";
      team.imageCar =
        $(teamElement).find("img.f1-c-image").last().attr("src") || "";

      team.color = TEAM_COLOR_MAPPING[team.name] || "#FFFFFF";

      let drivers: string[] = [];
      $(teamElement)
        .find("div.f1-team-driver-name")
        .each((_, driverDiv) => {
          const firstName = $(driverDiv).children("p:first").text();
          const lastName = $(driverDiv).children("p:last").text();
          drivers.push(`${firstName} ${lastName}`);
        });

      team.drivers = drivers;

      teams.push(team);
    }

    return teams;
  } catch (error) {
    console.error("Error scraping teams:", error);
    throw new Error("Failed to scrape teams");
  }
};

export const scrapeDrivers = async (): Promise<Driver[]> => {
  const url = "https://www.formula1.com/en/drivers.html";

  try {
    const response = await fetch(url);
    const text = await response.text();
    const $ = cheerio.load(text);

    let drivers: Driver[] = [];

    $("div.f1-inner-wrapper a.group").each((i, driverContainer) => {
      let driver: Driver = {} as Driver;

      driver.id = i;

      const rankingAndPoints = $(driverContainer).find(
        "div.flex.align-center.justify-between"
      );
      driver.rank = parseInt(
        rankingAndPoints.children("p.f1-heading-black").text().trim()
      );
      driver.points = parseInt(
        rankingAndPoints
          .children("div")
          .children("p.f1-heading-wide")
          .first()
          .text()
          .trim()
      );

      driver.team = $(driverContainer)
        .find("p.f1-heading__body")
        .last()
        .text()
        .trim();

      const driverName = $(driverContainer).find("div.f1-driver-name");
      driver.firstName = driverName.children("p").first().text().trim();
      driver.lastName = driverName.children("p").last().text().trim();

      driver.countryFlag =
        $(driverContainer).find("img[src*='flags']").attr("src") || "";

      driver.numberLogo =
        $(driverContainer)
          .find("img[src*='number-logos']")
          .first()
          .attr("src") || "";

      driver.image =
        $(driverContainer).find("img[src*='drivers']").last().attr("src") || "";

      drivers.push(driver);
    });

    return drivers;
  } catch (error) {
    console.error("Error scraping drivers:", error);
    throw new Error("Failed to scrape drivers");
  }
};
