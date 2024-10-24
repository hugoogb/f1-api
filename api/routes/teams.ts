import { Router } from "express";
import { scrapeTeams } from "../scraper";
import { supabase } from "../services/supabase";
import { Team } from "../types/teams.types";
import { PostgrestError } from "@supabase/supabase-js";

export const teamsRouter = Router();

teamsRouter.get("/", async (req, res) => {
  try {
    let {
      data: teams,
      error,
    }: { data: Team[] | null; error: PostgrestError | null } = await supabase
      .from("teams")
      .select("*");

    if (error || !teams || teams.length === 0) {
      const scrapedTeams = await scrapeTeams();

      const { error: insertError } = await supabase
        .from("teams")
        .insert(scrapedTeams);

      if (insertError) {
        throw new Error("Error saving teams to database");
      }

      res.status(200).json(scrapedTeams);
    } else {
      res.status(200).json(teams);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve or scrape teams" });
  }
});
