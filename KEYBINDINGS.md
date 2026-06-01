# Keybindings — the universal CapsLock = Hyper scheme

One muscle-memory layout across every machine and OS. **CapsLock is the modifier.**
Tapped alone it is still **Escape**; held together with another key it becomes **Hyper**.

## What "Hyper" is

Hyper = `Ctrl + Alt + Super` pressed together — a chord no sane app binds by default, so
it acts as a private, collision-free modifier. CapsLock is remapped to emit it.

| OS      | Hyper expands to         | Implemented with         | Status        |
|---------|--------------------------|--------------------------|---------------|
| Linux   | `Ctrl + Alt + Super`     | `keyd` + niri binds      | ✅ ga402-niri |
| macOS   | `Cmd + Option + Control` | Karabiner-Elements       | ⏳ planned    |
| Windows | `Ctrl + Alt + Win`       | AutoHotkey / PowerToys   | ⏳ planned    |

CapsLock **tap → Escape** on all three.

## The contract (chord → action)

`Mod` below means **Hyper** (= CapsLock).

### Apps
| Chord                | Action                  |
|----------------------|-------------------------|
| `Mod`+Return         | Terminal (alacritty)    |
| `Mod`+Shift+Return   | App launcher            |
| `Mod`+B              | Browser (Brave)         |
| `Mod`+G              | Messenger (Telegram)    |
| `Mod`+E              | File manager (nautilus) |

### Window / session
| Chord          | Action          |
|----------------|-----------------|
| `Mod`+Q        | Close window    |
| `Mod`+F        | Maximize column |
| `Mod`+Shift+F  | Fullscreen      |
| `Mod`+T        | Toggle floating |
| `Mod`+Shift+L  | Lock screen     |
| `Mod`+Shift+Q  | Session menu    |

### Clipboard (emits the OS-native copy/paste)
| Chord    | Action |
|----------|--------|
| `Mod`+C  | Copy   |
| `Mod`+V  | Paste  |

### Focus / move
- **Focus:** `Mod`+H/J/K/L (or arrows) → left / down / up / right
- **Move window:** `Super+Ctrl`+H/J/K/L (see note below)
- **Workspaces:** `Mod`+1..9 → switch; `Super+Ctrl`+1..9 → move column to workspace

> **Why "move" uses Super+Ctrl, not Hyper:** Hyper already contains Ctrl, so
> `Hyper+Ctrl+X` collapses to `Hyper+X` — the move family simply can't be expressed as a
> Hyper chord. It stays on the physical **Super+Ctrl** key so muscle memory is unchanged.
> Only Shift stacks cleanly on top of Hyper; the same constraint applies on macOS
> (`Cmd+Opt+Ctrl`) and Windows (`Ctrl+Alt+Win`).

## Where each OS implements it

- **Linux / niri:** `ga402-niri/keyd/default.conf` (CapsLock→Hyper, tap=Esc) +
  `ga402-niri/niri/.config/niri/cfg/keybinds.kdl` (the chords above, written as
  `Ctrl+Alt+Mod+<key>`).
- **macOS (future):** a `macos/` machine folder with Karabiner-Elements rules implementing
  this same contract.
