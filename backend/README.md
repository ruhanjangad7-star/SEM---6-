# Flask + MySQL Setup

## 1) Create MySQL database
Run this in MySQL:

```sql
CREATE DATABASE flask_app;
```

## 2) Setup environment

```powershell
cd d:\Pro\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` and set your MySQL password.

## 3) Run app

```powershell
python app.py
```

Open:
- `http://127.0.0.1:5000/`
- `http://127.0.0.1:5000/init-db` (creates tables)
