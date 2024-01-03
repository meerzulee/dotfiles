# Set __fish_private_mode_settable if fish_private_mode is settable
# Toggle, test, reset for both conditions
if set -gq fish_private_mode

    set -l _fish_private_mode $fish_private_mode
    set -ge fish_private_mode &>/dev/null
    if not set -gq fish_private_mode
        set -g __fish_private_mode_settable 1
        set -g fish_private_mode $_fish_private_mode
    end
    set -e _fish_private_mode

    # Also set fish_profile_private_mode while we're here
    set -g fish_profile_private_mode $fish_private_mode

else

    set -g fish_private_mode 1 &>/dev/null
    if set -gq fish_private_mode
        set -g __fish_private_mode_settable 1
        set -ge fish_private_mode
    end

end

# Load the --on-variable functions, and set initial value
fish-profile --use $fish_profile &>/dev/null
