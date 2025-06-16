# agentic_ea_v0


You need to set up your secrets. 

Create a new folder in the root directory called "secrets"

Add the following files (name them exactly like so):
- hound_stt_id
- hound_stt_key
- hound_tts_id
- hound_tts_key
- openai_api_key
- secret_encryption_key
- session_secret
- supabase_key
- supabse_url
- diy_depot_client_key

Then go through each of the individual files where a secret is used and comment out / un-comment the import logic.
- /fastapi-langgraph/app.py
- /express_supa/config/encryption.js
- /express_supa/config/supabaseClient.js
- /express_supa/config/encryption.js
- /express_supa/routes/metroclickRoutes.js
- /express_supa/routes/wallboardRoutes.js

Finally, there's one last line in the wallboardRoutes.js file where you have to change the endpoint where a fetch call is made.



To start the application, run:

docker compose build

docker compose up
