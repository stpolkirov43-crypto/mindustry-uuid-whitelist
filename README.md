# UUID Whitelist

[Русская версия](README.ru.md)

A lightweight JavaScript whitelist mod for Mindustry. It allows a player to join only when their UUID is present in the local allowlist.

## Features

- UUID-only connection filtering.
- F8 console management while hosting a game.
- Automatic persistent storage through Mindustry settings.
- Connected-player window with click-to-copy UUIDs.
- Connection history with click-to-copy UUIDs.
- Quick copying of the most recently connected player's UUID.
- Automatic disabling of Mindustry's built-in whitelist to avoid conflicting checks.

## Compatibility

- Tested target: Mindustry `160.5`.
- Minimum game version declared by the mod: `160`.
- Designed primarily for a game hosted from the desktop client, where the F8 JavaScript console and graphical dialogs are available.

## Installation

### From a ZIP file

1. Download the release ZIP.
2. Open **Mods** in Mindustry.
3. Select **Import Mod** and import the ZIP.
4. Make sure that no older copy of `uuid-whitelist` remains installed as either a ZIP or an extracted directory.
5. Restart Mindustry.

After loading, the console should contain:

```text
[UUID-WL] LOADED - build 1.5-mindustry-160.5-persistent
```

## F8 commands

Open the JavaScript console with F8 and use:

```javascript
uuidwl("help")
uuidwl("add", "PLAYER_UUID")
uuidwl("remove", "PLAYER_UUID")
uuidwl("clear")
uuidwl("players")
uuidwl("connections")
uuidwl("copy")
uuidwl("copy", "PLAYER_UUID")
```

### Command reference

| Command | Description |
| --- | --- |
| `uuidwl("add", "UUID")` | Adds a UUID and saves the list immediately. |
| `uuidwl("remove", "UUID")` | Removes a UUID and saves the list immediately. |
| `uuidwl("clear")` | Clears and saves the whitelist. |
| `uuidwl("players")` | Opens the connected-player list; click a row to copy its UUID. |
| `uuidwl("connections")` | Opens the last 50 connection attempts; click a row to copy its UUID. |
| `uuidwl("copy")` | Copies the most recently connected player's UUID. |
| `uuidwl("copy", "UUID")` | Copies the supplied UUID. |

## Persistent storage

The allowlist is stored in Mindustry settings under:

```text
uuid-whitelist.allowed-uuids.v1
```

Changes made with `add`, `remove`, or `clear` are written immediately and restored the next time Mindustry starts.

The connection history is intentionally session-only and is not written to disk.

## Optional initial UUIDs

Default entries can be added to `initialUUIDs` in `scripts/main.js`. They are used only when no saved list exists. Do not publish private player UUIDs in a public repository.

## Security notice

This mod is a convenience access-control tool, not strong authentication. A Mindustry UUID is client-provided and may be changed or spoofed by a determined user. Do not rely on this mod alone to protect a high-value or publicly exposed server.

The graphical `players` and `connections` commands depend on client UI classes and are not intended for a headless dedicated server without further adaptation.

## License

Released under the [MIT License](LICENSE).

## Author

Lasycase
