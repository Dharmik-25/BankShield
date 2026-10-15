FROM python:3.12-alpine

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py database.py risk_engine.py ./
COPY bankshield.db ./

RUN addgroup -S bankshield && \
    adduser -S bankshield -G bankshield && \
    chown -R bankshield:bankshield /app

USER bankshield

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "app:app"]
