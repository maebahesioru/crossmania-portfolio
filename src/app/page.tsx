import { About, Projects } from "@/components/About";
import { BBS } from "@/components/BBS";
import { BlogExplorer } from "@/components/BlogExplorer";
import { Hero } from "@/components/Hero";
import { LinksSection } from "@/components/LinksSection";
import { LiveGrid } from "@/components/LiveGrid";
import { RigSection } from "@/components/RigSection";
import { Skills } from "@/components/Skills";
import { ONION_URL } from "@/lib/site";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <BlogExplorer compact limit={6} />
      {/* .onion はサーバー側(env)から props で渡す。RigSection は "use client" なので
          process.env.X(NEXT_PUBLIC_ 以外)を自分では読めない。 */}
      <RigSection onion={ONION_URL} />
      <LiveGrid />
      <LinksSection />
      <BBS headingIndex="10" />
    </>
  );
}
