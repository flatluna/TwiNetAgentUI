import { useRef } from "react";

import { Player } from "@/components/audio/player";

const SAMPLE_RATE = 24000;

export default function useAudioPlayer() {
    const audioPlayer = useRef<Player>();

    const reset = async () => {
        audioPlayer.current = new Player();
        await audioPlayer.current.init(SAMPLE_RATE);
    };

    const play = (base64Audio: string) => {
        try {
            console.log("[DEBUG] Converting base64 audio to PCM, length:", base64Audio.length);
            const binary = atob(base64Audio);
            const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
            const pcmData = new Int16Array(bytes.buffer);
            console.log("[DEBUG] PCM data length:", pcmData.length);

            audioPlayer.current?.play(pcmData);
        } catch (error) {
            console.error("[DEBUG] Error playing audio:", error);
        }
    };

    const stop = () => {
        audioPlayer.current?.stop();
    };

    return { reset, play, stop };
}
