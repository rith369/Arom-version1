import { therapists } from "../../../lib/therapists";
export type PublicationStatus = "draft" | "published" | "archived";
export type Professional = {
  id: string; name: string; kmName: string; role: string; kmRole: string;
  specialties: string[]; languages: string[]; experience: string;
  about: string; kmAbout: string; image: string;
  session: "Online" | "In-person" | "Both"; status: PublicationStatus;
};
export const initialProfessionals: Professional[] = therapists.map((item) => ({
  id: item.slug, name: item.name, kmName: item.kmName ?? "", role: item.role,
  kmRole: item.kmRole ?? "", specialties: [...item.specialties], languages: [...item.languages],
  experience: item.experience, about: item.about, kmAbout: item.kmAbout ?? "", image: item.image,
  session: item.sessionOptions.length > 1 ? "Both" : item.sessionOptions[0] === "In-person" ? "In-person" : "Online",
  status: "published",
}));
