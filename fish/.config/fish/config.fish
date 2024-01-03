if status is-interactive
    # Commands to run in interactive sessions can go here
end

alias vim "nvim"
alias compose "docker-compose"

fish_add_path /opt/rocm/bin/
set --universal nvm_default_version v18.18.2
set --universal nvm_default_packages yarn

set -gx FLYCTL_INSTALL "/home/meerzulee/.fly"
set -gx PATH "$FLYCTL_INSTALL/bin:$PATH"


# pnpm
set -gx PNPM_HOME "/home/meerzulee/.local/share/pnpm"
if not string match -q -- $PNPM_HOME $PATH
  set -gx PATH "$PNPM_HOME" $PATH
end
# pnpm end

set -Ux AWS_PROFILE "default" 
fish_add_path "/home/meerzulee/Workspace/Android/platform-tools"

pyenv init - | source
set -gx PATH $PATH /home/meerzulee/Workspace/Android/emulator

