if status is-interactive
    # Commands to run in interactive sessions can go here
end

set --universal nvm_default_version lts/iron
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
set -gx DOCKER_HOST unix://$XDG_RUNTIME_DIR/docker.sock


set -gx ANDROID_HOME /home/meerzulee/android/sdk
set -gx JAVA_HOME /usr/lib/jvm/java-21-openjdk

set -Ua fish_user_paths /home/meerzulee/bin  
set -Ua fish_user_paths /home/meerzulee/.local/bin

set -Ua fish_user_paths /home/meerzulee/.turso  
set -Ua fish_user_paths /home/meerzulee/.bun/bin

set -Ua fish_user_paths $ANDROID_HOME/cmdline-tools/latest/bin
set -Ua fish_user_paths $ANDROID_HOME/platform-tools
#fish_greeting fortune | cowsay

zoxide init --cmd cd fish | source

oh-my-posh init fish --config ~/.config/posh-themes/emodipt-extend.omp.json | source

# pnpm
set -gx PNPM_HOME "/home/meerzulee/.local/share/pnpm"
if not string match -q -- $PNPM_HOME $PATH
  set -gx PATH "$PNPM_HOME" $PATH
end
# pnpm end

