import Navbar from "@/components/rootComponents/general/Navbar";
import Footer from "@/components/rootComponents/general/Footer";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      id="app-root"
      className={`font-sans 
            min-h-[100dvh] flex flex-col
          `}
    >
      {/* Global ambient noise overlay to give the black background a premium matte texture */}
      <div
        className="fixed inset-0 z-[-1] opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'
        }}
      />

      <Navbar />

      {/* Main content wrapper */}
      <main className="flex-1 relative z-0">
        {children}
      </main>

      <Footer />
    </div>
  );
}