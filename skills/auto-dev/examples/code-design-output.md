## Example 1: Generate from description

**Input:** `/code-design "a key-value cache with TTL"`

---

## Design Intent

- `Cache`: owns all storage and expiry logic; callers call `get`/`set`/`delete` without knowing eviction strategy or time representation
- TTL stored as absolute expiry timestamp internally — callers pass relative seconds, conversion is hidden
- Expired entries are purged lazily on access and periodically in the background, invisible to callers
- No external dependencies — the cache is self-contained and testable in isolation

```python
import time
import threading
from typing import Any, Optional


class Cache:
    """
    Key-value store with per-entry TTL.

    Callers interact only through get/set/delete.
    Expiry checking and eviction are internal concerns.
    """

    def __init__(self, cleanup_interval: float = 60.0) -> None:
        # _entries maps key -> (value, expiry_timestamp)
        # expiry_timestamp is None for entries with no TTL
        self._entries: dict[str, tuple[Any, Optional[float]]] = {}
        self._lock = threading.Lock()
        self._start_cleanup_thread(cleanup_interval)

    def get(self, key: str) -> Optional[Any]:
        """Return the value for key, or None if missing or expired."""
        with self._lock:
            entry = self._entries.get(key)
            if entry is None:
                return None
            value, expiry = entry
            if expiry is not None and time.monotonic() >= expiry:
                del self._entries[key]
                return None
            return value

    def set(self, key: str, value: Any, ttl: Optional[float] = None) -> None:
        """
        Store value under key.

        ttl: seconds until expiry, or None to never expire.
        """
        expiry = time.monotonic() + ttl if ttl is not None else None
        with self._lock:
            self._entries[key] = (value, expiry)

    def delete(self, key: str) -> None:
        """Remove key if present. No-op if key does not exist."""
        with self._lock:
            self._entries.pop(key, None)

    def _start_cleanup_thread(self, interval: float) -> None:
        thread = threading.Thread(target=self._cleanup_loop, args=(interval,), daemon=True)
        thread.start()

    def _cleanup_loop(self, interval: float) -> None:
        while True:
            time.sleep(interval)
            self._evict_expired()

    def _evict_expired(self) -> None:
        now = time.monotonic()
        with self._lock:
            expired = [k for k, (_, exp) in self._entries.items() if exp is not None and now >= exp]
            for key in expired:
                del self._entries[key]
```

---

## Example 2: Redesign existing file

**Input:** `/code-design src/session.py`

Original `src/session.py` (shallow, leaky design):

```python
import time, hashlib, os

sessions = {}

def create_session(user_id):
    token = hashlib.sha256(os.urandom(32)).hexdigest()
    sessions[token] = {"user_id": user_id, "created_at": time.time(), "expires_at": time.time() + 3600}
    return token

def get_user(token):
    s = sessions.get(token)
    if s and s["expires_at"] > time.time():
        return s["user_id"]
    return None

def delete_session(token):
    if token in sessions:
        del sessions[token]
```

---

## Design Intent

- `SessionStore`: owns all session state; callers create/validate/revoke sessions without knowing the storage structure, token format, or expiry representation
- Token generation is hidden — callers receive opaque strings and never construct or inspect tokens
- Expiry is stored as absolute timestamps internally; callers pass a TTL in seconds at creation; no time arithmetic leaks out

**What Changed:**
- The global `sessions` dict was module-level state accessible to any importer — moved inside `SessionStore` as a private attribute
- The raw session dict `{"user_id": ..., "created_at": ..., "expires_at": ...}` was a leaking internal structure callers could have depended on — replaced with a private dataclass
- `get_user` returned `None` on both missing and expired sessions with no distinction available to callers — the new `validate` returns `None` consistently, but the reason stays internal (callers don't need it)
- Token generation scattered `hashlib` and `os.urandom` at the call site — extracted to a private method

```python
import hashlib
import os
import time
from dataclasses import dataclass
from typing import Optional


@dataclass
class _Session:
    user_id: str
    expiry: float  # monotonic timestamp


class SessionStore:
    """
    Issues, validates, and revokes user sessions.

    Callers work only with opaque token strings.
    Storage structure, token format, and time representation are internal.
    """

    def __init__(self, ttl: float = 3600.0) -> None:
        self._ttl = ttl
        self._sessions: dict[str, _Session] = {}

    def create(self, user_id: str) -> str:
        """Create a session for user_id and return an opaque token."""
        token = self._generate_token()
        self._sessions[token] = _Session(
            user_id=user_id,
            expiry=time.monotonic() + self._ttl,
        )
        return token

    def validate(self, token: str) -> Optional[str]:
        """Return the user_id for a valid token, or None if missing or expired."""
        session = self._sessions.get(token)
        if session is None:
            return None
        if time.monotonic() >= session.expiry:
            del self._sessions[token]
            return None
        return session.user_id

    def revoke(self, token: str) -> None:
        """Invalidate a session. No-op if the token does not exist."""
        self._sessions.pop(token, None)

    @staticmethod
    def _generate_token() -> str:
        return hashlib.sha256(os.urandom(32)).hexdigest()
```
