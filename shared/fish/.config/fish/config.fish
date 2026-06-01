if status is-interactive
    # Commands to run in interactive sessions can go here
end

if not set -q SSH_AGENT_PID
    eval (ssh-agent -c)
end

# Add the SSH key and set the timeout for 30 minutes (1800 seconds)
ssh-add -l >/dev/null; or ssh-add -t 1800 ~/.ssh/id_ed_lol
mise activate fish | source
zoxide init fish | source
fzf --fish | source

alias n nvim
alias vim nvim
alias ls 'eza -lh --group-directories-first --icons=auto'
alias lsa 'ls -a'
alias lt 'eza --tree --level=2 --long --icons --git'
alias lta 'lt -a'
alias ff "fzf --preview 'bat --style=numbers --color=always {}'"
alias cd z
alias r rails
alias decompress='tar -xzf'
alias compose "docker compose"
alias lzg lazygit
alias lzd lazydocker

set -x EDITOR nvim
set -x SUDO_EDITOR "$EDITOR"
set -x BAT_THEME ansi
set -Ux OMARCHY_PATH "$HOME/.local/share/omarchy"
fish_add_path ~/.local/bin ~/.local/share/omarchy/bin /opt/rocm/bin
