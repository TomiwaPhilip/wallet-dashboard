"use server";
import { Props } from "@/components/forms/settings/SettingsForm";
import getSession from "./server-hooks/getsession.action";

interface SaveSettingsProps {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export async function SaveSettings({
  firstName,
  lastName,
  email,
  phoneNumber,
}: SaveSettingsProps) {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized!");
  }
}
