import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

request_logger = logging.getLogger("neuropath.request")

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        request_logger.info(
            f"Method: {request.method} | Path: {request.url.path} | "
            f"Status: {response.status_code} | Time: {process_time:.2f}ms"
        )
        return response
