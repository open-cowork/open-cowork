from sqlalchemy.orm import Session

from app.models.user_mcp_install import UserMcpInstall


class UserMcpInstallRepository:
    @staticmethod
    def create(session_db: Session, install: UserMcpInstall) -> UserMcpInstall:
        session_db.add(install)
        return install

    @staticmethod
    def get_by_id(session_db: Session, install_id: int) -> UserMcpInstall | None:
        return (
            session_db.query(UserMcpInstall)
            .filter(UserMcpInstall.id == install_id)
            .first()
        )

    @staticmethod
    def get_by_user_and_server(
        session_db: Session, user_id: str, server_id: int
    ) -> UserMcpInstall | None:
        return (
            session_db.query(UserMcpInstall)
            .filter(
                UserMcpInstall.user_id == user_id,
                UserMcpInstall.server_id == server_id,
            )
            .first()
        )

    @staticmethod
    def list_by_user(session_db: Session, user_id: str) -> list[UserMcpInstall]:
        return (
            session_db.query(UserMcpInstall)
            .filter(
                UserMcpInstall.user_id == user_id,
                UserMcpInstall.is_deleted.is_(False),
            )
            .order_by(UserMcpInstall.created_at.desc())
            .all()
        )

    @staticmethod
    def delete(session_db: Session, install: UserMcpInstall) -> None:
        session_db.delete(install)
