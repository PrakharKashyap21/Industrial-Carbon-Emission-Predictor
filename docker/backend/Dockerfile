FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for reportlab, matplotlib, and psycopg
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY backend/requirements.txt /app/requirements.txt

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend /app

# Create storage directories
RUN mkdir -p /app/storage/reports /app/models/saved_models

# Expose FastAPI port
EXPOSE 8000

# Set Environment Variables
ENV PYTHONUNBUFFERED=1
ENV APP_ENV=production

# Run Production ASGI Uvicorn Server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
