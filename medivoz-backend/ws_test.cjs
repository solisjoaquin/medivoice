const WebSocket = require('ws');

const agentId = 'agent_4701kmf1abzyevs9e1xqqxd238kk';
const apiKey = 'sk_7d541dc0ed0f4f7ae75102bb6164271c2e737348af4569cf';

async function testWebsocket() {
    console.log("Fetching signed URL...");
    const urlRes = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`, {
        headers: { 'xi-api-key': apiKey }
    });
    const urlData = await urlRes.json();
    const signedUrl = urlData.signed_url;

    if (!signedUrl) {
        console.error("No signed URL returned", urlData);
        return;
    }

    console.log("Connecting to WebSocket with signedUrl...");
    // @elevenlabs/react connects to the signedUrl directly.
    const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`;

    const wsParams = new URL(signedUrl).searchParams;
    let finalUrl = wsUrl;
    for (const [key, val] of wsParams.entries()) {
        finalUrl += `&${key}=${val}`;
    }

    console.log("Connecting to", finalUrl);
    const ws = new WebSocket(finalUrl);

    ws.on('open', () => {
        console.log("Connected to WS!");
        // Send the initial event
        ws.send(JSON.stringify({
            type: "conversation_initiation_client_data",
            conversation_config_override: {
                agent: {
                    prompt: {
                        prompt: "Test prompt"
                    }
                }
            }
        }));
        console.log("Sent initialization payload.");
    });

    ws.on('message', (data) => {
        console.log("Received:", data.toString());
    });

    ws.on('close', (code, reason) => {
        console.log(`Connection closed. Code: ${code}, Reason: "${reason.toString()}"`);
    });

    ws.on('error', (err) => {
        console.error("WS error:", err);
    });
}

testWebsocket();
