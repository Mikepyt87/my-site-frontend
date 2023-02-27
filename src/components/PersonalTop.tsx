import React from "react";

interface PersonalTopProps {
  imageUrl: string;
}

const PersonalTop: React.FC<PersonalTopProps> = ({ imageUrl }) => (
  <div className="personalTop">
    <img src={imageUrl} alt="Personal Top" />
  </div>
);

export default PersonalTop;
