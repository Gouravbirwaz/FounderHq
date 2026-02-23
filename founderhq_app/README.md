# FounderHQ Mobile

The central access point for FounderHQ, optimizing the founder-investor pipeline with real-time huddles, biometric vault security, and live terminal updates.

## Design Philosophy
This app blends the intuitive, actionable layout of **Google Pay** (with high-radius bottom sheets and a floating action button for priority actions) and the visually comprehensive data flows of **Groww** (vertical, smooth data streams and chart sparklines).

## Tech Stack
- **Flutter**: Latest stable.
- **State/DI**: `flutter_riverpod` (Scaffolded, ready for domain binding).
- **Network**: `dio` (with JWT injection interceptors configured).
- **Real-time**: `socket_io_client` & `flutter_webrtc`.
- **Local Storage**: `flutter_secure_storage` & `hive_flutter`.
- **UI Components**: `fl_chart` & `pie_chart` for data visualization.

---

## ⚡ Connecting to the FastAPI Backend

To point this newly created Flutter application to your FastAPI endpoints, you can override the `API_URL` environment variable during the build/run phase via dart-defines.

### Running Locally (Emulator)

If you are running your backend locally via Uvicorn (e.g., `uvicorn main:app --port 8000`), the base URL should reflect the emulator loopback.

For Android Emulators:
```bash
flutter run --dart-define=API_URL=https://unengaged-slatier-anibal.ngrok-free.dev
```
For iOS Simulators:
```bash
flutter run --dart-define=API_URL=https://unengaged-slatier-anibal.ngrok-free.dev
```

### Running in Production

If your FastAPI server is hosted on a remote domain (e.g., `https://api.founderhq.com`):

```bash
flutter run --release --dart-define=API_URL=https://api.founderhq.com
```

**Note on Sockets**:
The `SocketService` currently defaults to `https://unengaged-slatier-anibal.ngrok-free.dev`. You can pass a similar environment configuration `const String.fromEnvironment('SOCKET_URL')` if the websocket service originates from a different host than the REST APIs.
