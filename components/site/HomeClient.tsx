"use client";

import { motion } from "motion/react";
import { Hero } from "@/components/site/Hero";
import { QuickActions } from "@/components/site/QuickActions";
import { About } from "@/components/site/About";
import { Stats } from "@/components/site/Stats";
import { WhyChoose } from "@/components/site/WhyChoose";
import { Academics } from "@/components/site/Academics";
import { IntroVideo } from "@/components/site/IntroVideo";
import { SchoolIntroduction } from "@/components/site/SchoolIntroduction";
import { Infrastructure } from "@/components/site/Infrastructure";
import { StudentLife } from "@/components/site/StudentLife";
import { Achievements } from "@/components/site/Achievements";
import { Testimonials } from "@/components/site/Testimonials";
import { NewsEvents } from "@/components/site/NewsEvents";
import { Gallery } from "@/components/site/Gallery";
import { processHtmlAssetUrls } from "@/lib/site-data";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { Contact } from "@/components/site/Contact";

export function HomeClient({ textContent }: { textContent?: string | null }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <main>
        <Hero />
        <QuickActions />
        {textContent && textContent.trim().length > 0 && (
          <section className="bg-secondary/40 py-8 border-y border-border">
            <div className="container-page mx-auto max-w-6xl px-4 sm:px-6">
              <div
                className="prose dark:prose-invert max-w-none space-y-6 text-foreground leading-relaxed font-sans dynamic-page-content"
                dangerouslySetInnerHTML={{ __html: processHtmlAssetUrls(textContent) }}
              />
            </div>
          </section>
        )}
        <About />
        <Stats />
        <WhyChoose />
        <Academics />
        <Infrastructure />
        <StudentLife />
        <Achievements />
        <SchoolIntroduction />
        <Testimonials />
        <NewsEvents />
        <Gallery />
        <EnquiryForm />
        <Contact />
      </main>
    </motion.div>
  );
}
