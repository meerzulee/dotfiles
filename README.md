# dotfiles

Personal configuration, organized for **multiple machines and operating systems** and
deployed with [GNU stow](https://www.gnu.org/software/stow/).

## Layout

```
dotfiles/
├── shared/            # configs used on EVERY machine
│   ├── fish/          #   fish shell   -> ~/.config/fish
│   └── nvim/          #   neovim       -> ~/.config/nvim
├── ga402-niri/        # this laptop: ASUS ROG Zephyrus G14 (GA402RJ), niri/Wayland
│   ├── niri/          #   compositor   -> ~/.config/niri   (cfg/display.kdl = monitor layout)
│   ├── alacritty/     #   terminal     -> ~/.config/alacritty
│   ├── keyd/          #   CapsLock→Hyper -> /etc/keyd        (system file, not home-stowed)
│   └── packages/      #   installed-package snapshot         (inventory, not stowed)
├── KEYBINDINGS.md     # the universal CapsLock = Hyper shortcut contract
├── Makefile           # stow deployment
└── README.md
```

Each folder under `shared/`, and each machine folder, is a set of **stow packages**;
inside a package the path mirrors `$HOME` (e.g. `shared/fish/.config/fish/...` →
`~/.config/fish/...`).

### Groups
- **`shared/`** — identical on every box. Cross-machine tools go here.
- **`<machine>/`** — one folder per machine, named after it. This laptop is `ga402-niri`.
  A future Mac gets its own folder (e.g. `macbook-macos/`) where macOS-only configs
  (Karabiner, skhd, …) live. Inside a machine folder, `keyd/` and `packages/` are skipped
  by stow via `<machine>/.stow-local-ignore` (keyd is a `/etc` file; packages is just an
  inventory).

> `keyd` is Linux-specific but machine-agnostic; it sits under `ga402-niri/` for now and
> can be promoted to a shared `linux/` group once a second Linux box exists.

## Keybindings

CapsLock is a universal modifier ("Hyper") on every OS — **tap for Escape, hold for the
mod**. Full chord→action contract in **[KEYBINDINGS.md](KEYBINDINGS.md)**. On this laptop
it's implemented by keyd + niri inside `ga402-niri/`.

## Deploy

```sh
sudo pacman -S --needed stow keyd      # prerequisites (Arch / CachyOS)
make install                           # stow shared + this machine, install keyd
# another machine:
make MACHINE=macbook-macos install
```

Other targets: `make shared`, `make machine`, `make keyd`, `make packages` (refresh the
snapshot for `$(MACHINE)`), `make unstow` (remove all symlinks for the active groups).

> Stow runs with `--no-folding`, so `~/.config/<app>` stays a real directory and only the
> tracked files become symlinks — runtime files (fish history, nvim lockfiles) are left
> alone. On a machine that **already has** real config files, clear the tracked paths
> first or they'll conflict with stow.

## Secrets

Private material (SSH keys, AWS credentials) lives in a **separate** repo,
`dotfiles-secret`, organized the same per-machine way. It is intentionally kept out of
this repo.
