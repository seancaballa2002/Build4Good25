# Bobby the Handyman

A platform that lets users submit a household issue, uses an LLM to understand and structure the request, and then uses Retell AI to contact local handymen for quotes — returning back price, availability, and job details in a clean UI.

## Features

- Multi-modal input collection (text, with support for voice/image)
- LLM-powered parsing of user requests using Groq
- Price estimation using Gemini AI
- Clarifying questions for incomplete information
- Automated handyman contacting through Retell AI
- Quote display with pricing, availability, and service details

## Getting Started

First, set up the environment variables:

1. Copy the `.env.local.example` file to `.env.local`
2. Fill in the required API keys:
   - `GROQ_API_KEY`: Get from [Groq](https://console.groq.com)
   - `GEMINI_API_KEY`: Get from [Google AI Studio](https://makersuite.google.com)
   - `RETELL_API_KEY`: Get from [Retell AI](https://retellai.com)
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Get from [Supabase](https://supabase.com)

Then, install the dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## AI Integration Details

### Groq Integration (LLM Parser)

The project uses Groq's LLM API to parse unstructured user input into a structured format. The integration:
- Extracts issue details, name, address, available times, and budget
- Generates clarifying questions for missing information
- Falls back to regex parsing if the API call fails

### Gemini Integration (Price Estimation)

Gemini API is used to provide realistic price estimates for handyman tasks:
- Takes the issue description and location as input
- Returns a price range and explanation for the estimate
- Provides context for users about typical pricing in their area

### Retell AI Integration (Handyman Calls)

Retell AI is used to simulate or make actual calls to handymen:
- Uses a conversation flow agent to make realistic calls
- Dynamically fills in variables from user input like problem description and budget
- Returns structured quote data from handymen

#### Setting Up Retell AI

To set up the Retell AI integration:

1. Create an account at [Retell AI](https://retellai.com)
2. Create a Conversation Flow agent with the following configuration:
   ```json
   {
     "agent_id": "",
     "voice_id": "11labs-Cimo",
     "interruption_sensitivity": 0.8,
     "agent_name": "Conversation Flow Agent",
     "response_engine": {
       "type": "conversation-flow",
       "conversation_flow_id": "conversation_flow_bcf8f699636c"
     },
     "language": "en-US"
   }
   ```
3. Configure the conversation flow with these dynamic variables:
   - `problem`: The user's issue
   - `leak_type`: Detailed description of the issue
   - `price range`: The user's budget
   - `location`: The user's address
   - `phone_number`: Contact number for callbacks

4. Purchase or import a phone number in Retell
5. Set up a webhook in your Retell dashboard to point to your `/api/retell-webhook` endpoint
6. Copy your Retell API key to your `.env.local` file

## Demo Flow

1. User enters their issue description on the landing page
2. LLM parses the input and extracts structured data
3. User reviews and confirms details on the confirmation page
4. System calls handymen with the request details using Retell AI
5. User sees quotes from multiple providers on the results page
6. Quotes are updated with real call data as calls are completed

## Technologies Used

- Next.js 15
- TypeScript
- Tailwind CSS
- Groq API for LLM parsing
- Gemini API for price estimation
- Retell AI for handyman communication
- Supabase for data storage

## License

This project is licensed under the MIT License - see the LICENSE file for details.
