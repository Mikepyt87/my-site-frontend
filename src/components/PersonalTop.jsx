import personalPageTopVideo from "../assets/personalPageTopVideo.mp4";

const PersonalTop = () => (
  <div className="personalTop">
    <video
      className="personalPageTopVideo"
      src={personalPageTopVideo}
      autoPlay
      loop
      muted
    />
  </div>
);

export default PersonalTop;
