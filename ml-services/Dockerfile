FROM python:3.13-slim
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy project definition
COPY pyproject.toml uv.lock README.md ./

# Install dependencies using uv
RUN uv sync --frozen

# Copy the rest of the application
COPY . .

ENV PYTHONPATH=/app
EXPOSE 8000

# Run FastAPI dev server via uv
CMD ["uv", "run", "fastapi", "dev", "app/main.py", "--host", "0.0.0.0", "--port", "8000"]
