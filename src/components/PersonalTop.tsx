import React from "react";

interface PersonalTopProps {
  imageUrl: string;
}

const PersonalTop: React.FC<PersonalTopProps> = ({ imageUrl }) => {
  return (
    <div className="personalTop">
      <img src={imageUrl} alt="Personal Top" />
      {/* You can add any other elements or components here */}
    </div>
  );
};

export default PersonalTop;
