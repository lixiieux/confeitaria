import os
import sys
from unittest.mock import MagicMock, patch

from dotenv import load_dotenv
import pytest

# Ensure the api directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Load dotenv before importing the app components
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))

# Fallbacks for test environment variables
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("SECRET_KEY", "test_secret_key_for_dolcevita_sweetorder_123")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")

# Local app imports (disable E402 lint warning for intentional delayed import)
from main import app  # noqa: E402
from models.database import Base, get_db, engine, SessionLocal  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    # Create the tables
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up the tables
    Base.metadata.drop_all(bind=engine)
    # Remove test.db file if it exists
    if os.path.exists("./test.db"):
        try:
            os.remove("./test.db")
        except Exception:
            pass


@pytest.fixture(autouse=True)
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = SessionLocal(bind=connection)

    # Override get_db dependency to use the session in transaction
    def override_get_db():
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db

    yield session

    session.close()
    transaction.rollback()
    connection.close()
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def mock_pika():
    with patch("pika.BlockingConnection") as mock_conn_class:
        mock_conn = MagicMock()
        mock_channel = MagicMock()
        mock_conn.channel.return_value = mock_channel
        mock_conn_class.return_value = mock_conn
        yield mock_conn_class
