import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./home.css";
import "./mobile.css";
import "./admin/site-visual-editor.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Intro } from "@/components/Intro";
import { MotionProvider } from "@/motion/MotionProvider";
import { Cursor } from "@/motion/Cursor";
import { SculptureStage } from "@/three/SculptureStage";
import { getSite, getTeam } from "@/lib/content";
import { SiteVisualEditor } from "@/app/admin/SiteVisualEditor";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: { default: site.name, template: `%s | ${site.name}` },
    description: site.tagline,
    // While content is placeholder, keep the site out of search engines.
    robots: site.placeholder ? { index: false, follow: false } : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before first paint. Decides if animations start hidden ("motion on") and
// whether to show the first-visit intro. Failsafe: if the app has not started
// after 5s, everything is shown normally.
const bootScript = `(function(){try{var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.motion='off';return}d.dataset.motion='on';if(!localStorage.getItem('studio-intro-seen')){d.dataset.intro='on'}setTimeout(function(){if(!d.dataset.ready){d.dataset.motion='off';delete d.dataset.intro}},5000)}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [site, team] = await Promise.all([getSite(), getTeam()]);
  // One Sculpture piece per published team member (data-driven).
  const pieces = team.map((member) => ({ id: member.pieceId }));

  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable}`}
      style={{ "--accent": site.accentColor } as CSSProperties}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MotionProvider>
          <SiteVisualEditor />
          <Intro name={site.name} />
          <SculptureStage pieces={pieces} />
          <Navbar name={site.name} logo={site.logo} items={site.nav} cta={site.cta} />
          <main id="main">{children}</main>
          <Footer site={site} />
          <Cursor />
          <div className="grain" aria-hidden="true" />
        </MotionProvider>
      </body>
    </html>
  );
}
