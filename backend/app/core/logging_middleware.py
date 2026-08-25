import time
import uuid
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

logger = logging.getLogger("industrial_carbon_app")
logger.setLevel(logging.INFO)

if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] %(message)s")
    ch.setFormatter(formatter)
    logger.addHandler(ch)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Production Logging Middleware generating unique X-Request-ID and logging request latency and status."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000

        response.headers["X-Request-ID"] = request_id

        path = request.url.path
        # Sanitize query parameters to prevent logging credentials
        logger.info(f"[{request_id[:8]}] {request.method} {path} -> {response.status_code} ({process_time:.2f}ms)")

        return response
