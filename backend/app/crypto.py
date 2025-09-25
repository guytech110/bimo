import base64
from cryptography.fernet import Fernet
from hashlib import sha256
from .settings import settings


def _derive_key(secret: str) -> bytes:
    # Derive 32-byte key and base64 encode for Fernet
    h = sha256(secret.encode()).digest()
    return base64.urlsafe_b64encode(h)


def encrypt_json(plaintext: str) -> str:
    key = _derive_key(settings.SECRET_KEY)
    f = Fernet(key)
    return f.encrypt(plaintext.encode()).decode()


def decrypt_json(token: str) -> str:
    key = _derive_key(settings.SECRET_KEY)
    f = Fernet(key)
    return f.decrypt(token.encode()).decode()
