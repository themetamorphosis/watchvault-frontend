import UnderDevelopmentPage from "@/components/UnderDevelopmentPage";
import { Compass } from "lucide-react";

export default function DiscoveryPage() {
    return (
        <UnderDevelopmentPage
            title="Discovery"
            description="Explore new movies, TV shows, and anime based on your taste, trending content, and curated collections."
            features={[
                "Personalized recommendations based on your watchlist",
                "Trending and popular titles across all categories",
                "Curated collections and editorial picks",
            ]}
            icon={<Compass className="h-10 w-10 text-violet-400/40" />}
        />
    );
}
