"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { upload } from "@vercel/blob/client";
import { SaveImage } from "@/server/actions/auth/settings.action";

const ProfilePictureForm = ({ defaultImage }: { defaultImage: any }) => {
  const [image, setImage] = useState(defaultImage);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const fileReader = new FileReader();
    if (!inputFileRef.current?.files) {
      throw new Error("No file selected");
    }

    const file = inputFileRef.current.files[0];

    fileReader.onload = async (e) => {
      const fileData = e.target?.result;
      if (typeof fileData === "string") {
        try {
          const newBlob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/avatar/upload",
          });

          // Update the image state with the new blob URL
          setImage(newBlob.url);

          // Call a function to save the image URL to the database
          saveImageUrlToDB(newBlob.url);
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
    };
    fileReader.readAsDataURL(file);
  };

  const saveImageUrlToDB = async (imageUrl: string) => {
    // Call your function to save the image URL to the database here
    await SaveImage({ image: imageUrl });
    console.log("Image URL saved to DB:", imageUrl);
  };

  return (
    <div className="flex flex-col items-center mt-10 mb-5">
      <img
        src={image}
        alt="Profile"
        className="rounded-full border-8 border-[#23283A] w-40 h-40 mb-4"
      />
      <label
        htmlFor="imageInput"
        className="text-[#3344A8] cursor-pointer text-[20px] font-medium"
      >
        Upload Profile Picture
      </label>
      <input
        ref={inputFileRef}
        type="file"
        id="imageInput"
        className="hidden"
        accept="image/png, image/jpeg"
        onChange={handleImageChange}
      />
    </div>
  );
};

export default ProfilePictureForm;
