import TeamsLandingPage from "../services/teams/TeamsLandingPage";
import {
  mockTeams,
  mockUsers,
  mockEvents,
  mockFiles,
} from "../services/teams/teams-Mock";

const TeamsPage = () => {
  return (
    <TeamsLandingPage
      initialTeams={mockTeams}
      initialUsers={mockUsers}
      initialEvents={mockEvents}
      initialFiles={mockFiles}
    />
  );
};

export default TeamsPage;
