## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/KHNT_project.git
cd KHNT_project
```

> 💡 It is recommended to use a virtual environment:

```bash
python -m venv venv
# Activate the virtual environment:
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 2. Install Python Dependencies

Make sure you have **Python 3.9+** and `pip` installed.

```bash
cd football_analysis
pip install -r requirements.txt
```

### 3. Set Up the Frontend

```bash
cd ../tralalero-webapp
npm install --legacy-peer-deps
npm install formidable --legacy-peer-deps
```

### 4. Create a folder named "input_videos" in football_analysis folder

This folder will contain the football video 

### 5. Start the Web App

```bash
npm run dev
```

Then open your browser and go to:

```
http://localhost:3000
```

---

### 📥 Sample Video

[Download Sample Match Video (Google Drive)](https://drive.google.com/file/d/10PtDupMD493Gt2BavwW8Rp3ZNbdsCLKL/view?usp=sharing)

---
