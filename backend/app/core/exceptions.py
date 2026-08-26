from typing import Any


class ApplicationError(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 400,
        code: str = "APPLICATION_ERROR",
        details: Any | None = None,
    ) -> None:
        super().__init__(message)

        self.message = message
        self.status_code = status_code
        self.code = code
        self.details = details