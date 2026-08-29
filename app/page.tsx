import Navbar from "./_components/Navbar";
import Hero from "./_components/Hero";
import FeaturesBar from "./_components/FeaturesBar";
import BestSellers from "./_components/BestSellers";
import Categories from "./_components/Categories";
import Footer from "./_components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <BestSellers />
      <Categories />
      <FeaturesBar />
      <Footer />
    </>
  );
}
