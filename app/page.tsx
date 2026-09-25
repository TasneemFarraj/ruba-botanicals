import Navbar from "./_components/Navbar";
import Hero from "./_components/Hero";
import FeaturesBar from "./_components/FeaturesBar";
import BestSellers from "./_components/BestSellers";
import Categories from "./_components/Categories";
import MeetRubaTeaser from "./_components/MeetRubaTeaser";
import Footer from "./_components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Categories />
      <BestSellers />
      <MeetRubaTeaser />
      <FeaturesBar />
      <Footer />
    </>
  );
}
