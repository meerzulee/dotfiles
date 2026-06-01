# dotfiles — GNU stow deployment.  See README.md / KEYBINDINGS.md.
#
#   make install               shared + this machine (+ keyd)
#   make MACHINE=<name> install
#   make shared | machine | keyd | packages | unstow
#
# Groups (shared/, <machine>/) hold stow "packages" whose internal layout
# mirrors $HOME. keyd/ and packages/ are NOT stowed (see the machine's
# .stow-local-ignore); keyd is installed to /etc instead.
#
# --no-folding keeps ~/.config/<app> a real directory and symlinks only the
# tracked files, so runtime files (fish history, nvim lockfiles) stay put.

SHELL   := /bin/bash
MACHINE ?= ga402-niri
STOW    := stow --no-folding -v -t $(HOME)

SHARED_PKGS  := $(notdir $(patsubst %/,%,$(wildcard shared/*/)))
MACHINE_PKGS := $(filter-out keyd packages,$(notdir $(patsubst %/,%,$(wildcard $(MACHINE)/*/))))

.PHONY: install shared machine keyd packages unstow

install: shared machine keyd

shared:
	$(STOW) -d shared -R $(SHARED_PKGS)

machine:
	$(STOW) -d $(MACHINE) -R $(MACHINE_PKGS)

keyd:
	sudo install -Dm644 $(MACHINE)/keyd/default.conf /etc/keyd/default.conf
	sudo systemctl enable --now keyd
	-sudo keyd reload

packages:
	pacman -Qqen > $(MACHINE)/packages/pacman.txt
	pacman -Qqem > $(MACHINE)/packages/aur.txt
	@echo "snapshot: $$(wc -l < $(MACHINE)/packages/pacman.txt) native, $$(wc -l < $(MACHINE)/packages/aur.txt) AUR"

unstow:
	$(STOW) -d shared     -D $(SHARED_PKGS)
	$(STOW) -d $(MACHINE) -D $(MACHINE_PKGS)
