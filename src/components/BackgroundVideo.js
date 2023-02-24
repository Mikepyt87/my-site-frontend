import welcomePageVideo from "../assets/welcomePageVideo3.mp4";
const BackgroundVideo = () => {
  return (
    <video
      className="welcomePageVideo"
      src={welcomePageVideo}
      autoPlay
      loop
      muted
    />
  );
};

export default BackgroundVideo;
