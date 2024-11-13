import { Team } from "../types/teams.types";

export const areTeamsDifferent = (
  teams: Team[] | null,
  scrapedTeams: Team[],
  propertiesToCheck: (keyof Team)[]
): boolean => {
  if (!teams || teams.length !== scrapedTeams.length) {
    return true;
  }

  return teams.some((team) => {
    const scrapedTeam = scrapedTeams.find((t) => t.name === team.name);

    if (!scrapedTeam) return true;

    return propertiesToCheck.some((property) => {
      if (property === "drivers") {
        return (
          JSON.stringify(team.drivers) !== JSON.stringify(scrapedTeam.drivers)
        );
      }
      return team[property] !== scrapedTeam[property];
    });
  });
};
