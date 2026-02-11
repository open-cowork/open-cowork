import json

import lark_oapi as lark
from fastapi import APIRouter, Request
from fastapi.responses import Response as FastAPIResponse

from app.core.settings import get_settings
from app.schemas.response import Response
from app.services.feishu_event_dispatcher import FeishuEventDispatcher
from app.services.inbound_message_service import InboundMessageService

router = APIRouter(prefix="/webhooks/feishu", tags=["feishu"])


@router.post("")
async def webhook(request: Request) -> FastAPIResponse:
    settings = get_settings()

    if not settings.feishu_enabled:
        return Response.success(data={"ok": True, "ignored": "provider_disabled"})

    body = await request.body()
    payload = _parse_payload(body)
    if payload is None:
        return Response.error(code=400, message="Invalid payload", status_code=400)

    event_type = _extract_event_type(payload)
    if event_type and event_type not in {"url_verification", "im.message.receive_v1"}:
        return Response.success(data={"ok": True, "ignored": True})

    verification_token = _resolve_verification_token(
        payload=payload,
        configured=(settings.feishu_verification_token or "").strip(),
    )
    encrypt_key = (settings.feishu_encrypt_key or "").strip()

    dispatcher = FeishuEventDispatcher(
        verification_token=verification_token,
        encrypt_key=encrypt_key,
    )
    raw_response = dispatcher.dispatch(
        uri=request.url.path,
        headers=_build_raw_headers(request),
        body=body,
    )

    if raw_response.status_code is not None and raw_response.status_code >= 400:
        return _to_http_response(raw_response)

    service = InboundMessageService()
    for inbound in dispatcher.inbound_messages:
        await service.handle_message(message=inbound)

    return _to_http_response(raw_response)


def _parse_payload(body: bytes) -> dict[str, object] | None:
    try:
        payload = json.loads(body)
    except Exception:
        return None
    return payload if isinstance(payload, dict) else None


def _extract_event_type(payload: dict[str, object]) -> str:
    top_level_type = payload.get("type")
    if isinstance(top_level_type, str):
        value = top_level_type.strip()
        if value:
            return value

    header = payload.get("header")
    if isinstance(header, dict):
        event_type = header.get("event_type")
        if isinstance(event_type, str):
            return event_type.strip()

    return ""


def _resolve_verification_token(payload: dict[str, object], *, configured: str) -> str:
    if configured:
        return configured

    token = payload.get("token")
    if isinstance(token, str) and token.strip():
        return token.strip()

    header = payload.get("header")
    if isinstance(header, dict):
        header_token = header.get("token")
        if isinstance(header_token, str) and header_token.strip():
            return header_token.strip()

    return ""


def _build_raw_headers(request: Request) -> dict[str, str]:
    headers = {key: value for key, value in request.headers.items()}
    for key in (
        lark.X_REQUEST_ID,
        lark.LARK_REQUEST_TIMESTAMP,
        lark.LARK_REQUEST_NONCE,
        lark.LARK_REQUEST_SIGNATURE,
    ):
        value = request.headers.get(key)
        if value:
            headers[key] = value
    return headers


def _to_http_response(raw_response: lark.RawResponse) -> FastAPIResponse:
    return FastAPIResponse(
        status_code=raw_response.status_code or 200,
        headers=raw_response.headers,
        content=raw_response.content or b"",
    )
