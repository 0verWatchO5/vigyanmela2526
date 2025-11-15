import ShareLinkedInPost from "@/components/ShareLinkedInPost";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vigyanmela.chetanacollege.in";
const defaultShareUrl = `${baseUrl.replace(/\/$/, "")}/registration`;

export default function DemoPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">LinkedIn Sharing Demo</h1>
        <p className="text-sm text-muted-foreground">
          Use this page to verify the direct LinkedIn posting flow. The values below are prefilled with
          a sample message, registration link, and event hero image.
        </p>
      </div>
      <ShareLinkedInPost
        shareUrl={defaultShareUrl}
        title="Vigyan Mela 25 — Where Science Meets Innovation"
        description="Join Vigyan Mela 25 to explore cutting-edge science projects, workshops, and networking opportunities."
        defaultComment="Excited to attend Vigyan Mela 25! 🚀"
      />
    </div>
  );
}
