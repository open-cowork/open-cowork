import json
from typing import Any, Mapping

import lark_oapi as lark
from lark_oapi.api.im.v1 import P2ImMessageReceiveV1

from app.schemas.im_message import InboundMessage


class FeishuEventDispatcher:
    def __init__(self, *, verification_token: str, encrypt_key: str) -> None:
        self._inbound_messages: list[InboundMessage] = []
        self._handler = (
            lark.EventDispatcherHandler.builder(encrypt_key, verification_token)
            .register_p2_im_message_receive_v1(self._on_message_receive)
            .build()
        )

    @property
    def inbound_messages(self) -> list[InboundMessage]:
        return self._inbound_messages

    def dispatch(
        self,
        *,
        uri: str,
        headers: Mapping[str, str],
        body: bytes,
    ) -> lark.RawResponse:
        req = lark.RawRequest()
        req.uri = uri
        req.headers = dict(headers)
        req.body = body
        return self._handler.do(req)

    def _on_message_receive(self, data: P2ImMessageReceiveV1) -> None:
        inbound = _build_inbound_message(data)
        if inbound is not None:
            self._inbound_messages.append(inbound)


def _build_inbound_message(event: P2ImMessageReceiveV1) -> InboundMessage | None:
    data = event.event
    message = data.message if data else None
    if message is None:
        return None

    if str(message.message_type or "").strip().lower() != "text":
        return None

    text = _extract_text(message.content)
    if not text:
        return None

    chat_id = str(message.chat_id or "").strip()
    if not chat_id:
        return None

    sender = data.sender if data else None
    sender_type = str(sender.sender_type or "").strip().lower() if sender else ""
    if sender_type and sender_type != "user":
        return None

    sender_id = None
    sender_identity = sender.sender_id if sender else None
    if sender_identity is not None:
        raw_sender_id = (
            sender_identity.open_id
            or sender_identity.union_id
            or sender_identity.user_id
        )
        if raw_sender_id:
            sender_id = str(raw_sender_id).strip() or None

    event_id = str(event.header.event_id or "").strip() if event.header else ""
    message_id = str(message.message_id or event_id).strip()

    return InboundMessage(
        provider="feishu",
        destination=chat_id,
        send_address=chat_id,
        message_id=message_id,
        sender_id=sender_id,
        text=text,
        raw=_to_raw_payload(event),
    )


def _extract_text(content: Any) -> str:
    raw = str(content or "").strip()
    if not raw:
        return ""

    try:
        parsed = json.loads(raw)
    except Exception:
        return raw

    if isinstance(parsed, dict):
        text = parsed.get("text")
        if isinstance(text, str):
            return text.strip()

    return raw


def _to_raw_payload(event: P2ImMessageReceiveV1) -> dict[str, Any] | None:
    try:
        serialized = lark.JSON.marshal(event)
        if serialized is None:
            return None
        data = json.loads(serialized)
        return data if isinstance(data, dict) else None
    except Exception:
        return None
