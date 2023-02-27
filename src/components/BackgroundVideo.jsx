import welcomePageVideo from "../assets/welcomePageVideo3.mp4";

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
