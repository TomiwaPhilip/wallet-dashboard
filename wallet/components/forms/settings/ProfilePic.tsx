"use client";

import React, { useState } from "react";

const ProfilePictureForm = ({ defaultImage }: { defaultImage: any }) => {
  const [image, setImage] = useState(defaultImage);

  const handleImageChange = (e: any) => {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(selectedImage);
      // Call a function here to handle image upload and storage to the database
      // uploadImage(selectedImage);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10 mb-5">
      <img
        src={image || defaultImage}
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
