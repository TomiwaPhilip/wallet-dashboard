import ProfilePictureForm from "../forms/settings/ProfilePic";
import SettingsForm from "../forms/settings/SettingsForm";
import { Card2 } from "../shared/shared";

export default function SettingsPage() {
  return (
    <div>
      <h2 className="font-bold text-[24px]">Update your Mileston Profile</h2>
      <div className="flex items-start justify-center gap-5 w-full mt-10">
        <div className="flex-1">
          <Card2>
            <h3 className="font-semibold text-[20px] text-left">
              Personal Details
            </h3>
            <SettingsForm />
          </Card2>
        </div>
        <div className="flex-1">
          <Card2>
            <h3 className="font-semibold text-[20px] text-left">
              Profile Picture
            </h3>
            <ProfilePictureForm
              defaultImage={"/assets/images/profilepic.png"}
            />
          </Card2>
        </div>
      </div>
    </div>
  );
}
