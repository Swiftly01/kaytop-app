import Footer from "../_components/layouts/Footer";
import Navbar from "../_components/layouts/Navbar";
import "../styles/globals.css";

export default function LandingPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
