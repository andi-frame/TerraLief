from fastapi import FastAPI
from app.api.routes import router as api_router

app = FastAPI(title="TerraLief ML Services", version="0.1.0")

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "ml-services"}

app.include_router(api_router, prefix="/api")