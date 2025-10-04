Comprehensive Task List for LLM plan breaks down the MVP implementation into granular, sequential tasks with specific prompts. The goal is to build upon the existing codebase to achieve the MVP functionality defined in the GAP_ANALYSIS.md report.

Phase 1: Implement the Simple Card Editor
Goal: Create a new, performant, and user-friendly card editor for the MVP to address the performance issues of the existing one.

Create the New Editor File:

Task: Create the file for the new editor page.
Prompt: Create a new file at src/app/generator/simple/page.tsx.
Build the Editor's UI Layout:

Task: Implement a basic two-column layout for the editor and its live preview.
Prompt: In src/app/generator/simple/page.tsx, implement a functional React component. Use Flexbox to create a two-column layout. The left column (flex-grow: 1) will contain the editing controls, and the right column (flex-grow: 1) will contain the live preview.
Implement the Editing Controls:

Task: Add the UI components for editing the card's content and style.
Prompt: `In the left column of src/app/generator/simple/page.tsx, add the following controlled components from src/components/ui:
A Label and Textarea for the card message.
A Label and an HTML for the background color.
A Label and a Select component for font selection, with options for 'Serif', 'Sans-serif', and 'Monospace'. Use the useState hook to manage the state for message, backgroundColor, and fontStyle.`
Implement the Live Preview:

Task: Make the right column dynamically reflect the user's edits.
Prompt: In the right column of src/app/generator/simple/page.tsx, create a div that serves as the card preview. Apply inline styles to this div based on the state variables for backgroundColor and fontStyle. The text inside the div should be the message from the state. This preview must update in real-time as the user modifies the controls in the left column.
Create the 'Save Card' API Route:

Task: Create the backend endpoint that will save a new card to the database.
Prompt: `Create a new API route at src/app/api/cards/route.ts. Export an async POST function that:
Retrieves the current user's session from Supabase.
Parses the card data (message, backgroundColor, fontStyle) from the request body.
Uses the Prisma client to create a new record in the Card table, associating it with the user's ID.
Returns a 201 status code with the newly created card data upon success.`
Implement the 'Save Card' Functionality:

Task: Connect the editor's "Save" button to the new API endpoint.
Prompt: In src/app/generator/simple/page.tsx, add a Button component labeled "Save Card". When clicked, it should trigger a function that makes a POST request to /api/cards with the current card data from the state. Use the sonner toast component to display a success message upon a successful save, or an error message if the API call fails.
Update App Navigation for MVP:

Task: Temporarily direct users to the new simple editor.
Prompt: Modify the main navigation component in src/components/Navigation.tsx. Find the NavMenu component and update the link for "Generator" to point to /generator/simple.
Phase 2: Finalize Contact Management
Goal: Ensure users can import their contacts from Google and view them within the application.

Connect Google Import Frontend to Backend:

Task: Initiate the Google OAuth flow from the UI.
Prompt: Modify the src/components/contacts/ImportGoogle.tsx component. The "Import from Google" button's onClick handler should make a GET request to our backend API at /api/import/google/start. This endpoint will return a Google OAuth URL. The frontend should then programmatically redirect the user to this URL.
Implement the Google OAuth Callback:

Task: Handle the response from Google after user authorization and fetch their contacts.
Prompt: Flesh out the API route at /api/import/callback/google/route.ts. This endpoint will receive an authorization code from Google. Use the 'google-auth-library' to exchange this code for an access token. With the token, use the 'googleapis' library to call the People API (people.connections.list) to fetch the user's contacts. For each contact, extract their full name and birthday, and save them to our database using Prisma, associating them with the current user.
Create the 'Get Contacts' API Endpoint:

Task: Create an endpoint to supply the frontend with the user's contacts.
Prompt: `In the file src/app/api/contacts/route.ts, implement the GET handler. This function should:
Get the current user's ID from their Supabase session.
Use Prisma to find all contacts in the database where the userId matches.
Return the list of contacts as a JSON array.`
Display Contacts on the Contacts Page:

Task: Fetch and render the user's contacts on the contacts page.
Prompt: Modify the src/app/contacts/page.tsx component. Use a client-side data fetching hook like 'useEffect' or a library like 'react-query' to make a GET request to /api/contacts on page load. Render the fetched contacts in the ContactList component, displaying each contact's name and upcoming birthday.
Phase 3: Implement Email Sending
Goal: Allow users to send their saved cards to a recipient via email.

Create the 'Send Card' UI:

Task: Add a "Send" button and a modal to the card editor.
Prompt: In src/app/generator/simple/page.tsx, after a card is successfully saved, display a "Send Card" button. When this button is clicked, it should open a Dialog component from src/components/ui/dialog. The dialog should contain a form with an Input for the recipient's email and a "Send" Button.
Create the 'Send Card' API Endpoint:

Task: Create the backend logic to trigger the email-sending function.
Prompt: `Create a new API route at src/app/api/cards/[cardId]/send/route.ts. This should be a POST request handler that:
Retrieves the card details from the database using the cardId from the URL.
Gets the recipient's email from the request body.
Invokes the 'send-card' Supabase Edge Function with the required payload (e.g., card content and recipient email).
Returns a success response.`
Connect the 'Send' Dialog to the API:

Task: Make the final "Send" button call the new endpoint.
Prompt: In the "Send Card" dialog in src/app/generator/simple/page.tsx, the "Send" button's onClick handler should call the /api/cards/[cardId]/send endpoint, passing the recipient's email in the request body. Display a success toast upon completion.
Tasks for You (The Human User)
The following tasks require your manual intervention, as they involve managing external services, handling sensitive credentials, and making subjective decisions.

1. Supabase Project Configuration:

Configure SMTP Provider: For the send-card Edge Function to work, you must configure an email provider.
Action: Log in to your Supabase dashboard. Go to Project Settings -> Auth -> SMTP Provider and connect a service like SendGrid or Resend. This is mandatory for emails to be sent.
Review Edge Function:
Action: In the Supabase dashboard, go to Edge Functions and inspect the send-card function. Confirm the exact JSON payload it requires so the AI can build the API request correctly.
2. Google Cloud Platform Project Setup:

Enable People API:
Action: In the Google Cloud Console, navigate to your project, go to the "APIs & Services" dashboard, and ensure the "Google People API" is enabled.
Configure OAuth Consent Screen:
Action: Set up the OAuth consent screen with an application name, user support email, and other required details. This is what your users will see when they grant permission.
Create and Secure Credentials:
Action: Create OAuth 2.0 credentials for a "Web application".
In the credentials settings, add the following to "Authorized redirect URIs":
<http://localhost:3000/api/import/callback/google> (for local testing)
https://<your-production-url>/api/import/callback/google (for your deployed app)
Set Environment Variables:
Action: The Client ID and Client Secret you receive from Google must be kept secret. Add them to your local .env file and to the environment variable settings of your hosting provider (e.g., Vercel, Netlify). The AI will not handle these.
GOOGLE_CLIENT_ID="your_client_id_here"
GOOGLE_CLIENT_SECRET="your_client_secret_here"
3. Final Review and Testing:

UI/UX Review: Once the AI has built the simple editor, review it yourself. Does it feel right? Is it easy to use? Provide subjective feedback for any desired tweaks (e.g., "Change the save button color to green").
End-to-End Testing: Before considering the MVP complete, perform a full manual test of the user journey: Sign up -> Import Google Contacts -> Create a Card -> Save the Card -> Send the Card via Email. This will catch any integration issues that automated steps might miss.
