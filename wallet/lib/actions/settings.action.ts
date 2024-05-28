"use server";
import getSession from "./server-hooks/getsession.action";
import connectToDB from "../model/database";
import User from "../schemas/user";

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
}: SaveSettingsProps): Promise<boolean> {
  try {
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized!");
    }

    const userId = session.userId;

    connectToDB(); // Make sure to connect to the database properly

    const updatedUser = await User.findByIdAndUpdate(userId, {
      firstname: firstName,
      lastname: lastName,
      email: email,
      phoneNumber: phoneNumber,
      onbaorded: true,
    });

    if (updatedUser) {
      session.isOnboarded = true;
      session.firstName = firstName;
      session.lastName = lastName;
      session.email = email;
      await session.save();
      return true;
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error updating user settings:", error);
    return false;
  }
}

export interface UserDetails {
  firstName: string | "";
  lastName: string | "";
  email: string | "";
  phoneNumber: string | "";
  image: string | null; // Assuming profile picture is stored as a URL
}

export async function getUserDetailsWithImage(): Promise<UserDetails | null> {
  try {
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized!");
    }

    connectToDB();

    const userId = session.userId;

    // Assuming User is your mongoose model
    const user = await User.findById(userId);

    if (!user) {
      return null;
    }

    return {
      firstName: user.firstname,
      lastName: user.lastname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      image: user.image,
    };
  } catch (error: any) {
    throw new Error(`Error retrieving user details: ${error.message}`);
  }
}

export async function SaveImage({ image }: { image: string }) {
  try {
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized!");
    }

    const userId = session.userId;

    connectToDB(); // Make sure to connect to the database properly

    const updatedUser = await User.findByIdAndUpdate(userId, {
      image: image,
    });

    if (updatedUser) {
      session.image = image;
      await session.save();
      return true;
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error updating user settings:", error);
    return false;
  }
}
