import UnderDevelopmentPage from "@/components/UnderDevelopmentPage";
import { Users } from "lucide-react";

export default function SocialPage() {
    return (
        <UnderDevelopmentPage
            title="Social"
            description="Connect with friends, share your watchlists, and see what others are watching in real time."
            features={[
                "Follow friends and share watchlists",
                "Activity feed: see what your circle is watching",
                "Collaborative lists and watch parties",
            ]}
            icon={<Users className="h-10 w-10 text-rose-400/40" />}
        />
    );
}
