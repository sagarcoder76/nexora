import { ShareView } from "@/components/ShareView";

export const metadata = {
  title: "Shared journey",
  description: "A live journey shared with you by a Nexora traveller.",
};

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ShareView token={token} />;
}
