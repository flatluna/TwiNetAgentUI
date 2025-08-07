import React from "react";
import TwinVoiceChat from "@/components/voice/TwinVoiceChat";

const ChatVoicePage: React.FC = () => {
    return (
        <div className="h-full p-6 bg-background">
            <div className="max-w-4xl mx-auto">
                <TwinVoiceChat />
            </div>
        </div>
    );
};

export default ChatVoicePage;
