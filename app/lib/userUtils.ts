import { UserTeam } from "@/app/types/models_types/userType";

export const getFullName = (user: any): string => {
  if (!user) return "";

  // If user has firstName or lastName, use them
  if (user.firstName || user.lastName) {
    return (
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "Utilizator necunoscut"
    );
  }

  // Fallback to name if it exists
  return user.name || "Utilizator necunoscut";
};

export const getAvatarUrl = (user: any): string => {
  if (!user)
    return "https://ui-avatars.com/api/?name=Unknown&background=random";

  // Use profileImage if available
  if (user.profileImage) {
    return user.profileImage;
  }

  // Fallback to avatar for backward compatibility
  if (user.avatar) {
    return user.avatar;
  }

  // Generate UI Avatar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    getFullName(user)
  )}&background=0D8ABC&color=fff`;
};

export const createBackwardCompatibleUser = (
  user: UserTeam
): UserTeam & { name: string; avatar: string } => {
  console.log("TRANSFORMARE USER - Original user object:", user);

  const compatibleUser = {
    ...user,
    // Add virtual name property
    name: getFullName(user),
    // Add virtual avatar property
    avatar: user.profileImage || "",
  };

  console.log("TRANSFORMARE USER - Backward compatible user:", compatibleUser);
  return compatibleUser;
};
