if status is-interactive
    # Commands to run in interactive sessions can go here
end

set -gx PATH $PATH /opt/nvim-linux64/bin

set --universal nvm_default_version lts/hydrogen
set --universal nvm_default_packages yarn

alias c="code ." 
alias cc="clear" 
alias compose="docker compose"

alias vim="nvim"

alias ls="exa"

alias ll="exa -lh"




fish_ssh_agent

set -gx WARP_ENABLE_WAYLAND 1
set -gx MESA_D3D12_DEFAULT_ADAPTER_NAME "AMD"
set -gx BROWSER google-chrome

set -Ua fish_user_paths /home/meerzulee/bin  
set -Ua fish_user_paths /home/meerzulee/.local/bin


#fish_greeting fortune | cowsay

zoxide init --cmd cd fish | source

oh-my-posh init fish --config ~/.config/posh-themes/emodipt-extend.omp.json | source

# pnpm
set -gx PNPM_HOME "/home/meerzulee/.local/share/pnpm"
if not string match -q -- $PNPM_HOME $PATH
  set -gx PATH "$PNPM_HOME" $PATH
end
# pnpm end

rvm default
