import logging
import sys

import structlog

from app.core.config import settings


def configure_logging() -> None:
    log_level = logging.getLevelName(settings.log_level.upper())
    if not isinstance(log_level, int):
        log_level = logging.INFO
    logging.basicConfig(format="%(message)s", stream=sys.stdout, level=log_level)
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(log_level),
        cache_logger_on_first_use=True,
    )
