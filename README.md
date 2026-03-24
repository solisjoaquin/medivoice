**MediVoice**

*Your medical history. In your language. Out loud.*

Hackathon 2026 \| Health Track

  ------------------ ----------------------------------------------------
  **Team**           MediVoice

  **Track**          Health & Accessibility

  **Stack**          Node.js · React · Firecrawl · ElevenLabs · Gemini

  **Status**         MVP --- fully functional demo
  ------------------ ----------------------------------------------------


**The Problem**

Every year, millions of patients leave their doctor\'s office confused.
They were handed a prescription, a lab result, or a 12-page drug leaflet
--- and they didn\'t understand a word of it.

The usual solution? Google. Or a chatbot. But generic AI tools don\'t
know that you\'re allergic to penicillin, or that you\'re already taking
Metformin, or that your last kidney function test came back borderline.



**The Solution**

MediVoice is a voice-first medical assistant that combines three things no
other tool does together:

-   Your complete medical profile --- medications, conditions,
    allergies, studies

-   Real-time medical data --- scraped from drug leaflets and lab
    results by the doctor

-   Personalized audio responses --- narrated in a natural human voice

The result is a response like this:

```markdown
Example response (audio, ~25 seconds)                       
"Given your recent lab results showing borderline kidney function, and your current Metformin treatment, taking ibuprofen is not recommended --- it can further stress the kidneys and interfere with your diabetes medication. Your doctor specifically flagged this in your latest study. A safer option for pain relief would be paracetamol. If symptoms persist, please consult your doctor directly from this app.\"
```

**How It Works**

**For the Doctor**

-   Logs into the Doctor View within the same app

-   Adds the patient\'s current medications --- optionally with a URL to
    the official drug leaflet

-   Firecrawl automatically scrapes and stores the leaflet content

-   Uploads lab results and study findings as free text, with notes
    written in plain language for the patient

-   Toggles which medications and studies are \"assigned\" and visible
    to the AI

**For the Patient**

-   Opens MediVoice and asks a question in plain language

-   The AI cross-references the question against the full medical
    profile

-   Claude (Anthropic) generates a personalized, safe, 150-word response

-   ElevenLabs narrates the response in a warm, human voice

-   If the patient still has doubts, they open a direct chat with their
    doctor --- with the full medical context already loaded

**The Full Flow**

  ----------- ------------- ------------ ---------------- -------------- -----------
  👩‍⚕️          🕷️            💬           🧠               🎧             📱

  **Doctor    **Firecrawl   **Patient    **Claude         **ElevenLabs   **Patient
  loads       scrapes       asks         personalizes**   narrates**     hears
  leaflet     content**     question**                                   answer**
  URL**                                                                  
  ----------- ------------- ------------ ---------------- -------------- -----------

**Why Not Just Use ChatGPT?**

This is the first question judges will ask. Here\'s the honest answer:

  ----------------------------------- -----------------------------------
  **Generic AI (ChatGPT, Claude.ai)** **MediVoz**

  Requires the user to know how to    One tap --- designed for elderly
  prompt                              and low-literacy users

  Returns text                        Returns voice --- audio as the
                                      primary interface

  No patient history                  Cross-references full medical
                                      profile every time

  User pastes the leaflet manually    Doctor loads it once; Firecrawl
                                      handles the rest

  Generic answer for everyone         Personalized: allergies,
                                      conditions, drug interactions
                                      checked
  ----------------------------------- -----------------------------------

**Demo Scenario**

The following scenario is pre-loaded for the live demo. It demonstrates
the full end-to-end flow in under 2 minutes.

**Patient: María González, 58 years old**

-   Condition: Type 2 Diabetes + Hypertension

-   Current medication: Metformin 850mg (loaded with ANMAT leaflet)

-   Allergy: NSAIDs (registered in profile)

-   Latest study: Complete blood count --- HbA1c 8.2%, borderline kidney
    function (eGFR 62)

**Demo Steps**

-   Doctor view → load Metformin leaflet URL → Firecrawl scrapes it in
    real time

-   Doctor view → add study results + plain-language note about kidneys

-   Switch to patient view → ask: \"Can I take ibuprofen for my back
    pain?\"

-   MediVoz responds in audio: explains the risk, cites the kidney
    result, suggests paracetamol

-   Patient opens chat → asks follow-up question → AI already has full
    context

**API Reference**

**Patient Endpoints**

  ---------------------- ----------------------------------------------------
  **GET /profile**       Retrieve full medical profile

  **PUT /profile**       Replace entire profile

  **PATCH                Update one section (medications, allergies,
  /profile/:section**    conditions, studies)

  **POST /consult**      Body: { query } → Returns { text, audio (base64 MP3)
                         }

  **POST                 Same as above without ElevenLabs (dev mode)
  /consult/text-only**   

  **GET /chat**          Retrieve chat history

  **POST /chat**         Send message → AI responds with patient context
                         loaded

  **DELETE /chat**       Clear chat history
  ---------------------- ----------------------------------------------------

**Doctor Endpoints**

  ---------------------------------- ----------------------------------------------------
  **GET /doctor/medications**        List all medications loaded by doctor

  **POST /doctor/medications**       Body: { name, description?, url? } → Scrapes leaflet
                                     if URL provided

  **DELETE /doctor/medications/:id** Remove a medication

  **PATCH                            Toggle visibility for patient AI
  /doctor/medications/:id/assign**   

  **GET /doctor/studies**            List all studies

  **POST /doctor/studies**           Body: { name, date, result, notes? }

  **DELETE /doctor/studies/:id**     Remove a study

  **PATCH                            Toggle visibility for patient AI
  /doctor/studies/:id/assign**       
  ---------------------------------- ----------------------------------------------------

**Setup & Run**

**Requirements**

-   Node.js 18+

-   API keys: Anthropic, ElevenLabs, Firecrawl

**Backend**

```markdown
```bash
cd medivoz-backend
npm install
cp .env.example .env # Add your API keys
npm run dev # Runs on http://localhost:3000
```

**Frontend**

```bash
cd medivoz-frontend
npm install
npm run dev # Runs on http://localhost:5173
```

**Environment Variables**

  ------------------------- ----------------------------------------------------
  **GEMINI_API_KEY**     Gemini --- model access

  **ELEVENLABS_API_KEY**    ElevenLabs --- text-to-speech

  **ELEVENLABS_VOICE_ID**   ElevenLabs voice ID (use a Spanish voice for best
                            results)

  **FIRECRAWL_API_KEY**     Firecrawl --- web scraping

  **PORT**                  Backend port (default: 3000)
  ------------------------- ----------------------------------------------------


**Beyond the Hackathon**

MediVoice is designed to scale. The demo is a single-user proof of
concept, but the architecture maps directly to a production product:

-   Multi-patient support --- replace JSON with Postgres; add auth
    (Supabase)

-   Real doctor-patient connection --- invite system, role-based access

-   WhatsApp integration --- patients query by voice note; receive audio
    back

-   EHR integration --- pull studies automatically from hospital systems

-   Expanded language support --- ElevenLabs multilingual covers 30+
    languages

-   Medication reminder audio alerts --- daily narrated reminders with
    dosage context

```markdown
> **The bottom line:**
>
> The gap between "patients who understand their treatment" and "patients who don't" is not an intelligence gap. It's an accessibility gap.
>
> **MediVoz closes it — one audio response at a time.**
```