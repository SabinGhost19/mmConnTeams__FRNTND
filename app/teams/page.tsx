"use client";
import { useEffect, useState } from "react";
import TeamsLandingPage from "../services/teams/TeamsLandingPage";
import {
  mockTeams,
  mockUsers,
  mockEvents,
  mockFiles,
} from "../services/teams/teams-Mock";
import { api as axios } from "@/app/lib/api";
import Team from "@/app/types/models_types/team";
import Event from "@/app/types/models_types/event";
import File from "@/app/types/models_types/file";
import Channel from "@/app/types/models_types/channel";

const TeamsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialTeams, setTeams] = useState<Team[]>([]);
  useEffect(() => {
    const getTeams = async () => {
      try {
        const response = await axios.get("/api/teams");

        if (response.data) {
          const teamsWithDetails = await Promise.all(
            response.data.map(async (team: { id: any }) => {
              try {
                const channelsResponse = await axios.get(
                  `/api/teams/${team.id}/channels`
                );

                const membersResponse = await axios.get(
                  `/api/teams/${team.id}/members/ids`
                );

                return {
                  ...team,
                  channels: channelsResponse.data || [],
                  members: membersResponse.data || [],
                };
              } catch (error) {
                console.error(
                  `Eroare la preluarea detaliilor pentru echipa ${team.id}:`,
                  error
                );

                return {
                  ...team,
                  channels: [],
                  members: [],
                };
              }
            })
          );

          setTeams(teamsWithDetails);
          console.log("Teams with details:", teamsWithDetails);
        }
      } catch (error) {
        setError("A apărut o eroare la preluarea echipelor");
        console.error("Eroare la preluarea echipelor:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getTeams();
  }, []);
  return (
    <TeamsLandingPage
      initialTeams={initialTeams}
      initialUsers={mockUsers}
      initialEvents={mockEvents}
      initialFiles={mockFiles}
    />
  );
};

export default TeamsPage;
