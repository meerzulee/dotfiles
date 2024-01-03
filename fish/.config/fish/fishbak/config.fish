if status is-interactive
    # Commands to run in interactive sessions can go here
end

set PATH $PATH ~/.cargo/bin

set --universal nvm_default_version v18.18.2
set --universal nvm_default_packages yarn np
alias vim "nvim"
alias compose "docker compose"
