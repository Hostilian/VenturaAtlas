"""
Venture Atlas OS — Provider Error Classification
=================================================
Classifies raw API exceptions into structured error categories to drive
per-key vs. per-provider circuit breaking and backoff strategy.
"""

from enum import Enum

class ErrorCategory(str, Enum):
    AUTH_INVALID            = "AUTH_INVALID"
    PERMISSION_DENIED       = "PERMISSION_DENIED"
    RATE_LIMITED            = "RATE_LIMITED"
    PROVIDER_5XX            = "PROVIDER_5XX"
    TIMEOUT                 = "TIMEOUT"
    NETWORK_ERROR           = "NETWORK_ERROR"
    MODEL_NOT_FOUND         = "MODEL_NOT_FOUND"
    CONTEXT_TOO_LARGE       = "CONTEXT_TOO_LARGE"
    MALFORMED_RESPONSE      = "MALFORMED_RESPONSE"
    CONTENT_REJECTED        = "CONTENT_REJECTED"
    QUOTA_EXHAUSTED         = "QUOTA_EXHAUSTED"
    BUDGET_EXHAUSTED        = "BUDGET_EXHAUSTED"
    UNKNOWN_PROVIDER_ERROR  = "UNKNOWN_PROVIDER_ERROR"

def classify_error(exception_or_status: Exception | int, response_body: str = "") -> ErrorCategory:
    """Categorize an exception or HTTP status code."""
    if isinstance(exception_or_status, int):
        code = exception_or_status
        if code == 401:
            return ErrorCategory.AUTH_INVALID
        if code == 403:
            return ErrorCategory.PERMISSION_DENIED
        if code == 429:
            body_lower = response_body.lower()
            if "quota" in body_lower or "insufficient_quota" in body_lower or "credit" in body_lower:
                return ErrorCategory.QUOTA_EXHAUSTED
            return ErrorCategory.RATE_LIMITED
        if code == 404:
            return ErrorCategory.MODEL_NOT_FOUND
        if code == 413 or "context" in response_body.lower():
            return ErrorCategory.CONTEXT_TOO_LARGE
        if 500 <= code <= 599:
            return ErrorCategory.PROVIDER_5XX
    
    err_str = str(exception_or_status).lower()
    if "401" in err_str or "unauthorized" in err_str or "invalid api key" in err_str:
        return ErrorCategory.AUTH_INVALID
    if "429" in err_str or "rate limit" in err_str:
        return ErrorCategory.RATE_LIMITED
    if "timeout" in err_str or "timed out" in err_str:
        return ErrorCategory.TIMEOUT
    if "connection" in err_str or "network" in err_str:
        return ErrorCategory.NETWORK_ERROR
    if "json" in err_str or "decode" in err_str or "parse" in err_str:
        return ErrorCategory.MALFORMED_RESPONSE

    return ErrorCategory.UNKNOWN_PROVIDER_ERROR
