import { Router } from "express";
import { scrapeTeams } from "../scraper";
import { supabase } from "../services/supabase";
import { Team } from "../types/teams.types";
import { PostgrestError } from "@supabase/supabase-js";
import { areTeamsDifferent } from "../utils/teams";
import { TEAM_PROPERTIES_TO_CHECK } from "../constants/teams.constants";

export const teamsRouter = Router();

teamsRouter.get("/", async (req, res) => {
  try {
    let {
      data: teams,
      error,
    }: { data: Team[] | null; error: PostgrestError | null } = await supabase
      .from("teams")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    const ids: number[] = teams?.map((driver) => driver.id) || [];

    const scrapedTeams = await scrapeTeams();
    scrapedTeams.sort((a, b) => a.name.localeCompare(b.name));

    const isDifferent = areTeamsDifferent(
      teams,
      scrapedTeams,
      TEAM_PROPERTIES_TO_CHECK
    );

    if (isDifferent) {
      const { error: deleteError } = await supabase
        .from("teams")
        .delete()
        .in("id", ids);
      if (deleteError) throw new Error("Error deleting old teams");

      const { error: insertError } = await supabase
        .from("teams")
        .insert(scrapedTeams);
      if (insertError) throw new Error("Error saving new teams to database");

      res.status(200).json(scrapedTeams);
    } else {
      res.status(200).json(teams);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve or scrape teams" });
  }
});
