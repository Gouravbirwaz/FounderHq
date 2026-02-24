# Build Stage
FROM python:3.12-slim AS builder

WORKDIR /app

# Install system deps required for some python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libxml2-dev \
    libxslt-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final Stage
FROM python:3.12-slim

WORKDIR /app

# Copy only the installed packages from the builder stage
COPY --from=builder /root/.local /root/.local
COPY . .

# Ensure scripts in .local/bin are in PATH
ENV PATH=/root/.local/bin:$PATH

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
