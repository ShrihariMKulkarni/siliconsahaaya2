# AI-Powered Public Grievance Intelligence & Resolution Platform - Advanced Features

## 1. Updated System Architecture
The system architecture transitions from a standard web application to a **City Intelligence Engine** by integrating distributed AI microservices alongside the core backend. 

* **Frontend Client (React/Next.js)** captures multimodular input (text, images, location) and displays real-time analytics.
* **API Gateway (FastAPI)** routes requests to either the Core CRUD Services, the AI Pipeline Services, or the Vector DB for Search/RAG.
* **Core Backend (FastAPI)** manages users, authorities, conventional complaints, and status workflows.
* **AI Processing Engine** (Python Microservices) runs dedicated inference for:
  - Translation & NLP Classification
  - Computer Vision / Image Object Detection
  - Duplicate Clustering (Embeddings)
  - Time-to-Resolution Prediction (Regression)
* **Databases**:
  - **Relational/Document (PostgreSQL/MongoDB)**: Stores users, complaints, departments, and logs.
  - **Vector DB (Pinecone/Milvus or pgvector)**: Stores embeddings of complaints and FAQ knowledge for similarity search and the RAG Chatbot.
  - **Blob Storage (S3/Cloudinary)**: Stores original and "after resolution" images.

## 2. Updated Technology Stack
* **Frontend**: React.js / Next.js, Tailwind CSS, Leaflet/Mapbox for geospatial maps.
* **Backend**: FastAPI (Python), Uvicorn, Celery (for async AI jobs), Redis (Message Broker).
* **Database**: PostgreSQL (with PostGIS for mapping & pgvector for embeddings) OR MongoDB + Pinecone.
* **AI / ML**: 
  - NLP & Translation: Hugging Face Transformers (`Helsinki-NLP/opus-mt` for Indian languages), LangChain.
  - Vision: YOLOv8 (Ultralytics), OpenCV.
  - Standard ML: Scikit-learn (Random Forest Regressor for ETA prediction).
* **Deployment**: Docker, docker-compose, AWS EC2 / Vercel, GitHub Actions (CI/CD).

## 3. AI Pipeline
**Multilingual text & Computer Vision workflow:**
1. **Input Capture:** Text (in local language) + Image + GPS coordinates.
2. **Language Detection & Translation:** `langdetect` identifies the local language (e.g., Hindi, Kannada). Hugging Face translation models convert it to English.
3. **Computer Vision:** YOLOv8 runs over the uploaded image to output bounding boxes and labels (e.g., `pothole`, `garbage`).
4. **NLP Classification & Severity:** The translated English text is passed through a zero-shot classifier (e.g., `facebook/bart-large-mnli`) to identify categories (Sanitation, Roads) and gauge severity/sentiment.
5. **Data Merge:** The detected visual labels and NLP classifications are combined to confirm the grievance category and priority score.

## 4. Chatbot Architecture
An **AI Grievance Assistant Chatbot** powered by Retrieval-Augmented Generation (RAG).
* **Framework**: LangChain + OpenAI API (or open-source Llama-3).
* **Knowledge Retrieval**: 
  - *FAQ / Department Info*: Stored in the Vector Database.
  - *User specific info*: Uses a tool/callable function to query the SQL database (e.g., `SELECT status FROM complaints WHERE id = ?`).
* **Flow**: 
  - User asks "What is my complaint status for ID 1234?" -> LLM agent routes request to the SQL tool -> tool fetches "In Progress" -> LLM responds to user naturally.
  - User asks "Who handles water issues?" -> LLM embeds query -> searches Vector DB FAQs -> returns "The Water Authority department".

## 5. Updated Database Schema (PostgreSQL Example)
**Table:** `complaints`
* `id` (UUID, Primary Key)
* `citizen_id` (UUID, Foreign Key)
* `original_text` (Text, Local Language)
* `translated_text` (Text, English)
* `language` (VARCHAR, e.g., 'hi', 'kn')
* `category` (VARCHAR, Auto-assigned)
* `department_id` (UUID, Foreign Key, Auto-assigned)
* `status` (Enum: Pending, Assigned, Resolved)
* `priority_score` (Integer 1-100)
* `image_url` (VARCHAR)
* `after_image_url` (VARCHAR) - *For verification*
* `latitude`, `longitude` (Float / PostGIS Point)
* `cluster_id` (UUID, nullable) - *For duplicates*
* `predicted_resolution_days` (Integer)

## 6. New API Endpoints Required
* `POST /api/v1/complaints/submit` (Handles multiline, multipart-form with images, triggers async AI pipeline)
* `GET /api/v1/complaints/heatmap` (Returns GeoJSON of complaints clustered by location)
* `POST /api/v1/chatbot/chat` (Receives chat messages, returns RAG responses)
* `PUT /api/v1/complaints/{id}/verify` (Authorities upload `after_image_url`, updates status)
* `GET /api/v1/analytics/reports/weekly` (Generates aggregations and returns PDF/JSON report)
* `POST /api/v1/complaints/check-duplicate` (Vector search for similar complaints before finalizing submission)

## 7. Updated Frontend UI Design
* **Citizen View**: Prominent "Chat with Assistant" FAB (Floating Action Button). Multi-language selector dropdown at the top navigation. An intuitive map picking tool for reporting. A timeline view for their complaint (Submitted -> Analyzed by AI -> Assigned -> Fixed -> Waiting Citizen Verification).
* **Authority Dashboard**: A **Geo-spatial Heatmap** tab showing red spots where multiple identical issues cluster. "Before vs After" image comparison sliders in the resolution modal. ETA tags indicating if a complaint is "Overdue" against ML predictions.

## 8. Backend Service Architecture
Use a microservices approach to isolate heavy AI loads from standard CRUD operations:
1. **API Web Server**: Fast, lightweight, authenticates users, reads from DB.
2. **AI Worker Service**: Celery/Redis queue. When a `/submit` request hits the API, the image and text are pushed to the queue. The GPU/CPU intensive worker picks it up, runs Translation, YOLO, and Embedding extraction, then updates the database schema asynchronously.
3. **Cron Job / Scheduler**: Runs daily to trigger the "Smart City Report Generation" and evaluate delayed complaints.

## 9. Example ML Model Code Snippets

**Translation Pipeline (HuggingFace):**
```python
from transformers import pipeline

def translate_to_english(text, source_lang="hi"):
    # Using Helsinki-NLP models depending on source language
    model_name = f"Helsinki-NLP/opus-mt-{source_lang}-en"
    translator = pipeline("translation", model=model_name)
    result = translator(text)
    return result[0]['translation_text']
```

**Duplicate Detection (Embeddings):**
```python
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer('all-MiniLM-L6-v2')

def is_duplicate(new_complaint, existing_complaints, threshold=0.85):
    new_embedding = model.encode([new_complaint])
    existing_embeddings = model.encode(existing_complaints)
    
    similarities = cosine_similarity(new_embedding, existing_embeddings)
    max_sim = similarities.max()
    
    if max_sim > threshold:
         # Found a duplicate!
         return True
    return False
```

## 10. Deployment Strategy
* **Containerization**: Write `Dockerfile` for the backend, frontend, and AI worker. Use `docker-compose.yml` to orchestrate them alongside PostgreSQL/Redis.
* **Hosting**: For a hackathon MVP:
  * Deploy Frontend on **Vercel** or **Netlify** (Free, instant CI/CD).
  * Deploy Backend API + AI Worker on **Render** or **AWS EC2 (t3.medium)**.
  * Use **Supabase** or **Neon** for a managed PostgreSQL database.
* **Environment Logic**: Keep HuggingFace models cached locally into the Docker image or a mounted volume to avoid downloading models on every server restart.

## 11. Hackathon Demo Walkthrough
1. **The Hook (0:00 - 0:30):** Show the city heatmap. "Cities are drowning in unorganized complaints. Look at these hotspots."
2. **Citizen Submission in Native Tongue (0:30 - 1:30):** Open the citizen app. Type a text in Hindi: *"सड़क पर बहुत बड़ा गड्ढा है"* (There's a huge pothole on the road). Upload a picture of a pothole. 
3. **AI Magic - Backend View (1:30 - 2:30):** Split screen to show logs. The system detects "Hindi", translates it, runs YOLO on the image, detects a `pothole`. It compares the location embedding with others and merges it into an existing hotspot cluster. It assigns it automatically to the "Public Works Department" with an ETA of "2 days".
4. **Chatbot (2:30 - 3:00):** Ask the chatbot: "What is my complaint status?" Chatbot queries the DB and replies "Assigned to Public works."
5. **Resolution Verification (3:00 - 3:30):** Log in as an Authority. Snap a picture of a fixed road (the 'After' photo). The system matches the categories. The citizen gets a notification.
6. **The Climax - Report Generation (3:30 - 4:00):** Generate a 1-click weekly PDF dashboard report showcasing department efficiency and automated smart routing success.
