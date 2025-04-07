import { UserTeam } from "@/app/types/models_types/userType";

/**
 * Gets a user's full name from firstName and lastName fields
 */
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

/**
 * Gets the avatar URL for a user, falling back to UI Avatars
 */
export const getAvatarUrl = (user: any): string => {
  if (!user) return "";

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

/**
 * Creates a backward compatible user object that works with older code
 * expecting name and avatar properties
 */
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
