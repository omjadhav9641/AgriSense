FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt uvicorn

COPY . /app/ml

ENV PYTHONPATH=/app
ENV PORT=8500
EXPOSE 8500

CMD ["sh", "-c", "uvicorn ml.main:app --host 0.0.0.0 --port ${PORT:-8500}"]
