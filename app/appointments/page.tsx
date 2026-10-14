import type { Metadata } from "next";
import { UserAppointments } from "../_components/appointments/user-appointments";

export const metadata: Metadata = {
  title: "My appointments",
};

export default function AppointmentsPage() {
  return <UserAppointments />;
}
