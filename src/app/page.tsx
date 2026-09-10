import { About, Projects } from "@/components/About";
import { BBS } from "@/components/BBS";
import { BlogExplorer } from "@/components/BlogExplorer";
import { Hero } from "@/components/Hero";
import { LinksSection } from "@/components/LinksSection";
import { LiveGrid } from "@/components/LiveGrid";
import { RigSection } from "@/components/RigSection";
import { Skills } from "@/components/Skills";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <BlogExplorer compact limit={6} />
      <RigSection />
      <LiveGrid />
      <LinksSection />
      <BBS headingIndex="10" />
    </>
  );
}
