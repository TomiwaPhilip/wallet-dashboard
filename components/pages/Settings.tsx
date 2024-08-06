"use client";

import { useState, useEffect } from "react";
import ProfilePictureForm from "../forms/settings/ProfilePic";
import SettingsForm from "../forms/settings/SettingsForm";
import { Card2 } from "../shared/shared";
import {
  UserDetails,
  getUserDetailsWithImage,
} from "@/server/actions/auth/settings.action";

export default function SettingsPage() {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(
    "/assets/images/profilepic.png",
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUserDetailsWithImage();
        if (data) {
          console.log(data.image);
          setUserDetails(data);
          setProfilePic(data.image);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="font-bold text-[24px]">Update your Mileston Profile</h2>
      <div className="flex flex-col items-center justify-center gap-5 w-full mt-10 md:flex-row md:items-start">
        <div className="flex-1">
          <Card2>
            <h3 className="font-semibold text-[20px] text-left">
              Personal Details
            </h3>
            {userDetails && (
              <SettingsForm
                defaultValues={{
                  firstName: userDetails.firstName,
                  lastName: userDetails.lastName,
                  email: userDetails.email,
                  phoneNumber: userDetails.phoneNumber,
                }}
              />
            )}
          </Card2>
        </div>
        <div className="flex-1">
          <Card2>
            <h3 className="font-semibold text-[20px] text-left">
              Profile Picture
            </h3>
            {userDetails && <ProfilePictureForm defaultImage={profilePic} />}
          </Card2>
        </div>
      </div>
    </div>
  );
}
