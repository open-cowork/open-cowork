import json
import logging

import lark_oapi as lark
from lark_oapi.api.im.v1 import (
    CreateMessageRequest,
    CreateMessageRequestBody,
)

from app.core.settings import get_settings

logger = logging.getLogger(__name__)


class FeishuClient:
    provider = "feishu"
    max_text_length = 3000

    def __init__(self) -> None:
        settings = get_settings()
        self._app_id = (settings.feishu_app_id or "").strip()
        self._app_secret = (settings.feishu_app_secret or "").strip()
        self._domain = (settings.feishu_open_base_url or lark.FEISHU_DOMAIN).rstrip("/")
        self._enabled = bool(
            settings.feishu_enabled and self._app_id and self._app_secret
        )
        self._client = self._build_client() if self._enabled else None

    @property
    def enabled(self) -> bool:
        return bool(self._enabled and self._client is not None)

    def _build_client(self) -> lark.Client | None:
        try:
            return (
                lark.Client.builder()
                .app_id(self._app_id)
                .app_secret(self._app_secret)
                .domain(self._domain)
                .build()
            )
        except Exception:
            logger.exception("feishu_client_init_failed")
            return None

    async def send_text(self, *, destination: str, text: str) -> None:
        client = self._client
        if client is None:
            return

        request: CreateMessageRequest = (
            CreateMessageRequest.builder()
            .receive_id_type("chat_id")
            .request_body(
                CreateMessageRequestBody.builder()
                .receive_id(destination)
                .msg_type("text")
                .content(json.dumps({"text": text}, ensure_ascii=False))
                .build()
            )
            .build()
        )

        try:
            if client.im is None:
                logger.warning("feishu_im_unavailable")
                return
            response = await client.im.v1.message.acreate(request)
        except Exception:
            logger.exception("feishu_send_error")
            return

        if not response.success():
            logger.warning(
                "feishu_send_failed",
                extra={
                    "code": response.code,
                    "msg": response.msg,
                    "log_id": response.get_log_id(),
                },
            )
