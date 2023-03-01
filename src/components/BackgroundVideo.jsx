import welcomePageVideo from "../assets/welcomePageVideoWithName.mp4";

const BackgroundVideo = () => (
  <video
    className="welcomePageVideo"
    src={welcomePageVideo}
    autoPlay
    loop
    muted
  />
);

export default BackgroundVideo;
