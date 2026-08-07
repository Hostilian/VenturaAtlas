FROM python:3.11-slim

WORKDIR /app

COPY services/ventureatlas-worker/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8080 \
    PYTHONUNBUFFERED=1

EXPOSE 8080

CMD ["python", "services/ventureatlas-worker/app.py"]
