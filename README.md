# UK House Prices Dashboard

A full-stack web application for exploring historical UK house price data, with a focus on London and regional segmentation by property type.

## Features

- Historical price trends by region and sub-region
- Segmentation by property type: flats, terraced, semi-detached, detached
- London borough drill-down
- Indexed performance comparisons across geographies
- Optional AI-powered natural language insights

## Data Sources

- [UK House Price Index (HPI)](https://www.gov.uk/government/collections/uk-house-price-index-reports) — ONS/Land Registry, monthly averages from 1995
- [Land Registry Price Paid Data](https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads) — individual transactions

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Python 3.12, FastAPI |
| Data Processing | Pandas |
| Frontend | React 18, TypeScript |
| Visualisation | Recharts |
| Styling | Tailwind CSS |
| Containerisation | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Vercel (frontend), Railway (backend) |

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker & Docker Compose

### Local Development

```bash
# Clone the repo
git clone https://github.com/YH-Sui/uk-house-price.git
cd uk-house-price

# Start all services
docker-compose up --build
```

Or run individually:

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Project Structure

```
uk-house-price/
├── .github/workflows/      # CI/CD pipelines
├── backend/
│   ├── app/
│   │   ├── api/            # Route handlers
│   │   ├── data/           # Ingestion & processing
│   │   ├── models/         # Pydantic schemas
│   │   └── main.py
│   └── tests/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── api/
├── data/
└── notebooks/
```

## Branching Strategy

```
main        ← production only, protected
develop     ← integration branch
feature/*   ← new features (PR → develop)
fix/*       ← bug fixes (PR → develop)
```
