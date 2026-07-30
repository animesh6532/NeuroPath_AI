import os
import logging
from logging.handlers import RotatingFileHandler

def setup_logging():
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)

    # Configure custom app logger
    logger = logging.getLogger("neuropath")
    logger.setLevel(logging.INFO)

    # Prevent duplicating logs when setup_logging is called multiple times
    if not logger.handlers:
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )

        # Backend log handler
        backend_handler = RotatingFileHandler(
            os.path.join(log_dir, "backend.log"),
            maxBytes=10*1024*1024,
            backupCount=5
        )
        backend_handler.setLevel(logging.INFO)
        backend_handler.setFormatter(formatter)
        logger.addHandler(backend_handler)

        # Errors log handler
        errors_handler = RotatingFileHandler(
            os.path.join(log_dir, "errors.log"),
            maxBytes=10*1024*1024,
            backupCount=5
        )
        errors_handler.setLevel(logging.ERROR)
        errors_handler.setFormatter(formatter)
        logger.addHandler(errors_handler)

        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

    # Request logger
    request_logger = logging.getLogger("neuropath.request")
    request_logger.setLevel(logging.INFO)
    if not request_logger.handlers:
        request_formatter = logging.Formatter(
            "%(asctime)s - %(message)s"
        )
        request_handler = RotatingFileHandler(
            os.path.join(log_dir, "request.log"),
            maxBytes=10*1024*1024,
            backupCount=5
        )
        request_handler.setFormatter(request_formatter)
        request_logger.addHandler(request_handler)

    return logger
