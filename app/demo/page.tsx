import AnimatedBox from "@/components/animatedbox";
import ShareLinkedIn from "@/components/ShareLinkedInPost";
import ShareLinkedInPost from "@/components/ShareLinkedInPost";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const shareUrl = `${baseUrl}/registration`;

export default function DemoPage() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <meta property="og:title" content="Thanks for Registering!" />
      <meta property="og:description" content="I just registered using LinkedIn OAuth." />
      <meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
      <meta property="og:url" content="https://yourdomain.com/registration" />
      <meta property="og:type" content="website" />
      <AnimatedBox />
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">LinkedIn Share Options</h2>
        <div className="flex items-center gap-4">
          <ShareLinkedIn
            shareUrl={shareUrl}
            title="Vigyan Mela — Where Science Meets Innovation"
            // summary="Explore cutting-edge science projects and register now."
            // source="Vigyan Mela"
            // size={48}
          />
          <span className="text-sm text-muted-foreground">Standard share dialog (user adds commentary manually).</span>
        </div>
        <ShareLinkedInPost
          shareUrl={shareUrl}
          title="Vigyan Mela Launch"
          description="Visit us for innovation, workshops, and networking."
          defaultComment="Excited to attend Vigyan Mela! 🚀"
        />
      </div>
    </div>
  );
}
