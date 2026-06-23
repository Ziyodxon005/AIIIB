export class GeminiLiveClient {
    constructor(apiKey, model = "models/gemini-2.5-flash-native-audio-preview-12-2025") {
        this.apiKey = apiKey;
        this.model = model;
        this.ws = null;
        this.onAudioData = null;
        this.onOpen = null;
        this.onClose = null;
        this.onError = null;
        this.onTurnComplete = null;
        this.onInterrupted = null;
        this.onSourceUrl = null;
        this._shownUrls = new Set();
        this._hasGroundingCurrentTurn = false;
    }

    connect(systemInstruction, voiceName = 'Kore') {
        this.voiceName = voiceName;
        const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log("Connected to Gemini Live");
            this.sendSetup(systemInstruction);
            if (this.onOpen) this.onOpen();
        };

        this.ws.onmessage = async (event) => {
            let data = event.data;
            if (data instanceof Blob) {
                data = await data.text();
            }
            try {
                const response = JSON.parse(data);
                this.handleMessage(response);
            } catch (e) {
                console.error("Error parsing message", e);
            }
        };

        this.ws.onerror = (error) => {
            console.error("WebSocket Error", error);
            if (this.onError) this.onError(error);
        };

        this.ws.onclose = (event) => {
            console.log("Disconnected", event.code, event.reason);
            if (this.onClose) this.onClose(event);
        };
    }

    sendSetup(systemInstruction) {
        const setupMessage = {
            setup: {
                model: this.model,
                generation_config: {
                    response_modalities: ["AUDIO"],
                    speech_config: {
                        voice_config: {
                            prebuilt_voice_config: {
                                voice_name: this.voiceName
                            }
                        }
                    }
                },
                system_instruction: {
                    parts: [{ text: systemInstruction }]
                },
                tools: [
                    {
                        google_search: {}
                    }
                ],
                realtime_input_config: {
                    automatic_activity_detection: {
                        disabled: false,
                        start_of_speech_sensitivity: "START_SENSITIVITY_HIGH",
                        end_of_speech_sensitivity: "END_SENSITIVITY_HIGH",
                        prefix_padding_ms: 20,
                        silence_duration_ms: 500
                    }
                }
            }
        };
        this.ws.send(JSON.stringify(setupMessage));
    }

    sendAudioChunk(base64Audio) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const msg = {
                realtime_input: {
                    media_chunks: [{ mime_type: "audio/pcm;rate=16000", data: base64Audio }]
                }
            };
            this.ws.send(JSON.stringify(msg));
        }
    }

    sendVideoFrame(base64Image) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const msg = {
                realtime_input: {
                    media_chunks: [{ mime_type: "image/jpeg", data: base64Image }]
                }
            };
            this.ws.send(JSON.stringify(msg));
        }
    }

    sendTextMessage(text) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const msg = {
                client_content: {
                    turns: [{ role: "user", parts: [{ text: text }] }],
                    turn_complete: true
                }
            };
            this.ws.send(JSON.stringify(msg));
        }
    }

    // Recursively extract all http(s) URLs from anywhere in the response object
    _extractAllUrls(obj, found = []) {
        if (!obj || typeof obj === 'number' || typeof obj === 'boolean') return found;
        if (typeof obj === 'string') {
            // Skip base64 blobs (very long strings)
            if (obj.length > 2000) return found;
            const matches = obj.match(/https?:\/\/[^\s)"'<>,\]]+/g) || [];
            matches.forEach(u => found.push(u));
            return found;
        }
        if (Array.isArray(obj)) {
            obj.forEach(item => this._extractAllUrls(item, found));
            return found;
        }
        if (typeof obj === 'object') {
            Object.entries(obj).forEach(([key, val]) => {
                // Skip inlineData — it's audio/image base64, no URLs
                if (key === 'inlineData' || key === 'data') return;
                this._extractAllUrls(val, found);
            });
        }
        return found;
    }

    // Block obvious technical/namespace/CDN URLs — pass everything else
    _isValidSourceUrl(url) {
        try {
            const host = new URL(url).hostname.toLowerCase();
            const blocked = [
                'w3.org', 'schema.org', 'xmlsoap.org',
                'openxmlformats.org', 'xmlns.com', 'purl.org',
                'gstatic.com', 'googletagmanager.com',
                'doubleclick.net', 'ampproject.org',
            ];
            if (blocked.some(b => host.includes(b))) return false;
            if (!host.includes('.')) return false;
            return true;
        } catch {
            return false;
        }
    }


    handleMessage(response) {
        // AI interrupted (user spoke over it)
        if (response.serverContent?.interrupted) {
            console.log('AI interrupted by user');
            this._shownUrls.clear();
            this._hasGroundingCurrentTurn = false;
            if (this.onInterrupted) this.onInterrupted();
            return;
        }

        // Reset shown URLs on new turn start (first audio chunk signals new turn)
        if (response.serverContent?.modelTurn) {
            const parts = response.serverContent.modelTurn.parts || [];
            const hasAudio = parts.some(p => p.inlineData?.mimeType?.startsWith('audio/pcm'));
            if (hasAudio && !this._hasGroundingCurrentTurn && this._shownUrls.size === 0) {
                // New turn starting, reset
                this._hasGroundingCurrentTurn = false;
            }
            for (const part of parts) {
                if (part.inlineData?.mimeType?.startsWith("audio/pcm")) {
                    if (this.onAudioData) this.onAudioData(part.inlineData.data);
                }
            }
        }

        // === GROUNDING URL EXTRACTION ===
        if (this.onSourceUrl) {
            const grounding = response.serverContent?.groundingMetadata;

            if (grounding) {
                // PRIORITY 1: groundingChunks — actual source URLs (when available)
                const chunks = grounding.groundingChunks || [];
                let foundChunk = false;
                chunks.forEach(chunk => {
                    const uri = chunk.web?.uri;
                    const title = chunk.web?.title || uri;
                    if (uri && !this._shownUrls.has(uri)) {
                        foundChunk = true;
                        this._hasGroundingCurrentTurn = true;
                        this._shownUrls.add(uri);
                        this.onSourceUrl(uri, title);
                    }
                });

                // PRIORITY 2: webSearchQueries → direct lex.uz search URL
                // (Gemini Live API rarely returns groundingChunks, so this is the main path)
                if (!foundChunk) {
                    const queries = grounding.webSearchQueries || [];
                    queries.forEach(query => {
                        const cleanQuery = query.replace(/site:\S+\s*/gi, '').trim();
                        if (!cleanQuery) return;

                        // Always link to lex.uz — the source for Uzbek laws
                        const url = 'https://lex.uz';

                        if (!this._shownUrls.has(url)) {
                            this._shownUrls.add(url);
                            this._hasGroundingCurrentTurn = true;
                            this.onSourceUrl(url, cleanQuery);
                        }
                    });
                }
            }
        }



        if (response.serverContent?.turnComplete) {
            // Reset for next turn
            this._shownUrls.clear();
            this._hasGroundingCurrentTurn = false;
            if (this.onTurnComplete) this.onTurnComplete();
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this._shownUrls.clear();
    }
}
