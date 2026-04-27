Project Structure (Monorepo)
API/
  app.py              # Flask backend entry point
  controllers/        # Handling HTTP requests (named after pages/sections)
    learn_controller.py
  handlers/           # Orchestrating functions (folder per controller, file per endpoint)
    learn/
      toggle_session_handler.py
  services/           # Core business logic (named after technical capability)
    stt_service.py
  requirements.txt
  .env.example
  .env

UI/
  public/
    index.html        # Single HTML entry point
  src/
    index.js          # React entry point with main App component
    Webpages/         # Page-level components
      Home/
        Home.js
        Home.css
      Learn/
        Learn.js
        Learn.css
    Components/       # Reusable components
      AppBar/
        AppBar.js
        AppBar.css
  package.json
  .env.example
  .env

README.md
.gitignore
UI Structure Rules
Each component/page must have its own folder
Use external CSS files, no inline or internal styles
Folder structure: ComponentName/ComponentName.js + ComponentName.css
Code Style Philosophy
Clean and minimal code: - No comments - No API docstrings - No error handling (add only when debugging) - No print statements (add only when debugging)

Import ordering: - Order imports by ascending character length - Example: import os before import numpy before from flask import Flask

Debug mode only: - Add print statements temporarily when bugs occur - Add error handling temporarily when needed - Remove after fixing

README Template
For monolithic repos with UI and API, always include quick reference commands:

cd API
python -m venv .venv
.venv\Scripts\activate    
python.exe -m pip install --upgrade pip
pip install -r requirements.txt
python app.py

cd UI
npm install
npm start

git status
git add .
git commit -m "quick commit"
git push
API Structure Rules
All routes have /api/{controller_name} prefix structure
Each controller blueprint is registered with url_prefix='/api/{controller_name}'
Controllers use Flask blueprints with route decorators
Controllers handle HTTP request/response validation
Handlers orchestrate service functions
Services contain core business logic
Hardcode constants like port directly (port=5000, not PORT variable)
Naming Conventions: - Controllers: Named after page/section (e.g., learn_controller.py) - Handlers: Folder per controller, file per endpoint action (e.g., handlers/learn/toggle_session_handler.py) - Services: Named after technical capability (e.g., stt_service.py, tts_service.py, llm_service.py)

Environment Variables
Load env variables using dotenv in app.py
Only use .env for API keys and secrets
Constants like PORT, timeouts, etc. go at the top of respective files after imports
Other files import env variables from app.py if needed
Dependencies
All dependencies must be in requirements.txt
Use --extra-index-url for additional package sources (e.g., PyTorch CUDA)
Setup should only require pip install -r requirements.txt
Git Ignore
Only ignore essentials: - .env - .venv - pycache - node_modules - .kiro - .vscode

Setup Commands
Backend (run in API/):

python -m venv .venv
.venv\Scripts\activate
python.exe -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
Frontend (run in UI/):

npm install
npm start