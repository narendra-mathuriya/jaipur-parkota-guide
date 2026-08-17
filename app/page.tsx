import { JaipurExplorer } from "@/components/JaipurExplorer";
import { buildStructuredData } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildStructuredData()).replace(/</g, "\\u003c")
        }}
      />
      <JaipurExplorer />
    </>
  );
}
