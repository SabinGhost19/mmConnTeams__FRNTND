// Define the UserProfileDTO interface
export interface UserProfileDTO {
  id: string;
  userId: string;
  institution: string;
  studyLevel: string;
  specialization: string;
  year: number;
  group: string;
  bio: string;
  profileImageUrl: string;
  phoneNumber: string;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}
