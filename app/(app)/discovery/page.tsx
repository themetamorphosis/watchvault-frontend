import UnderDevelopmentPage from "@/components/UnderDevelopmentPage";
import { Compass } from "lucide-react";

export default function DiscoveryPage() {
    return (
        <UnderDevelopmentPage
            title="Discovery"
            description="Explore new movies, TV shows, and anime tailored to your taste. Get personalized recommendations and discover trending content."
            features={[
                "Personalized 'For You' recommendations",
                "Trending and popular content discovery",
                "Mood-based browsing with curated collections",
                "Advanced filters and smart search",
            ]}
            icon={<Compass className="h-10 w-10 text-violet-400/40" />}
        />
    );
}
