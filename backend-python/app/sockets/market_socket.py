"""
WebSocket endpoint that broadcasts live market ticks every second.
Clients connect to ws://localhost:8000/ws/market
"""
import asyncio
import json
from fastapi import WebSocket, WebSocketDisconnect
from app.services.market_service import get_market_snapshot
from app.models.market import MarketAlert
from app.services.market_service import get_price


class MarketConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = MarketConnectionManager()


async def market_ws_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            snapshot = get_market_snapshot()
            await websocket.send_json({"type": "tick", "data": snapshot})
            await asyncio.sleep(1.5)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
