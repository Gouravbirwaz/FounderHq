import os
from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db
from app.api.v1 import auth, market, poc, jobs, funding, community,schedule
from app.sockets.market_socket import market_ws_endpoint
from app.services.news_scraper import scrape_and_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    # Kick off initial news scrape on startup (non-blocking)
    try:
        await scrape_and_store()
    except Exception:
        pass
    yield


app = FastAPI(
    title="FounderHQ API",
    description="Cyber-professional command center for the Indian startup ecosystem.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"Validation error for {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(exc.body)},
    )

# REST Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(market.router, prefix="/api/v1")
app.include_router(poc.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")
app.include_router(funding.router, prefix="/api/v1")
app.include_router(community.router, prefix="/api/v1")
app.include_router(schedule.router, prefix="/api/v1")

# Static files for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# WebSocket
@app.websocket("/ws/market")
async def websocket_market(websocket: WebSocket):
    await market_ws_endpoint(websocket)


@app.get("/server")
async def root():
    return {"message": "FounderHQ API is live 🚀", "docs": "/docs"}
