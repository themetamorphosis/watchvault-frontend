import UnderDevelopmentPage from "@/components/UnderDevelopmentPage";
import { Bot } from "lucide-react";

export default function AiPage() {
    return (
        <UnderDevelopmentPage
            title="AI Agent"
            description="Your personal AI assistant for discovering content, managing your library, and getting smart recommendations."
            features={[
                "Natural language search across your entire library",
                "Smart suggestions: 'What should I watch tonight?'",
                "Automated tagging and organization of your collection",
            ]}
            icon={<Bot className="h-10 w-10 text-cyan-400/40" />}
        />
    );
}
