export class Player {
    private playbackNode: AudioWorkletNode | null = null;

    async init(sampleRate: number) {
        try {
            const audioContext = new AudioContext({ sampleRate });
            await audioContext.audioWorklet.addModule("audio-playback-worklet.js");

            this.playbackNode = new AudioWorkletNode(audioContext, "audio-playback-worklet");
            this.playbackNode.connect(audioContext.destination);
            console.log("[DEBUG] Audio player initialized successfully");
        } catch (error) {
            console.error("[DEBUG] Failed to initialize audio player:", error);
            throw error;
        }
    }

    play(buffer: Int16Array) {
        if (this.playbackNode) {
            console.log("[DEBUG] Playing audio buffer of length:", buffer.length);
            this.playbackNode.port.postMessage(buffer);
        } else {
            console.error("[DEBUG] Cannot play audio: playbackNode is null");
        }
    }

    stop() {
        if (this.playbackNode) {
            this.playbackNode.port.postMessage(null);
        }
    }
}
