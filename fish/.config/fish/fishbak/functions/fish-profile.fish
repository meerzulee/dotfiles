function fish-profile -d "Work with fish profiles and private mode"

    set -l options \
        (fish_opt -s p -l prune) \
        (fish_opt -s u -l use) \
        (fish_opt -s h -l help --long-only)
    argparse \
        --stop-nonopt \
        $options \
        -- $argv

    if set -q _flag_help
        __fish_profile_help
        return
    end
    if set -q _flag_prune
        __fish_profile_prune
        return
    end
    if set -q _flag_use
        set -g fish_profile $argv[1]
        return 0
    end

    env fish_profile=$argv[1] $__fish_bin_dir/fish $argv[2..-1]

end


function __fish_profile_help
    echo "Usage: fish-profile [OPTIONS] [PROFILE]

Open a new fish shell with PROFILE, or the default profile if not provided.

Options:
  -p, --prune       Prune orphaned private history files
  -u, --use         Switch to PROFILE in current session
      --help        Show this help message and exit"
end


function __fish_profile_prune

    # These files aren't created when fish_private_mode is settable
    set -gq __fish_private_mode_settable && return 0

    for f in $__fish_user_data_dir/private_*_history
        set -l pid (echo $f | string replace -r '.*/private_.*_([0-9]+)_history' '$1')
        if test -d /proc/$pid
            if ! test (basename (realpath /proc/$pid/exe)) = fish
                rm -v $f
            end
        else
            rm -v $f
        end
    end

end


function __fish_profile_on_fish_history --on-variable fish_history

    if set -gq __fish_private_mode_settable
        or not set -gq fish_profile_private_mode

        # If unset, or empty, or "default", use "fish" instead
        # This way, $__fish_user_data_dir/"$fish_history"_history is always the
        #   history file used (when not in private mode)

        if set -gq fish_history
            switch $fish_history
                case "" default
                    set -g fish_history fish
            end
        else
            set -g fish_history fish
        end

        if test "$fish_profile" != "$fish_history"
            set -g fish_profile $fish_history
        end

    end

    __fish_profile_on_variable fish_history "'$fish_history'"

end


# This function will only work when fish_private_mode is settable
function __fish_profile_on_fish_private_mode --on-variable fish_private_mode

    if set -gq fish_private_mode && not set -gq fish_profile_private_mode
        set -g fish_profile_private_mode $fish_private_mode
    else if not set -gq fish_private_mode && set -gq fish_profile_private_mode
        set -ge fish_profile_private_mode
    end

    __fish_profile_on_variable fish_private_mode "'$fish_private_mode'"

end


function __fish_profile_on_fish_profile --on-variable fish_profile

    # If unset, or empty, or "default", use "fish" instead
    # This way, $__fish_user_data_dir/"$fish_profile"_history is always the
    #   history file used (when not in private mode)

    if set -gq fish_profile
        switch $fish_profile
            case "" default
                set -g fish_profile fish
            case \*
                # Check that arg is valid
                begin
                    true # Be sure exit status is 0 before calling `set`
                    # yes, "$fish_profile", not "fish_profile"
                    # Emulate setting `fish_history` to an invalid value
                    if not set -l $fish_profile &>/dev/null
                        echo error: Profile "'$fish_profile'" is not a valid variable name. Falling back to `fish`.
                        set -g fish_profile fish
                    end
                end
        end
    else
        set -g fish_profile fish
    end

    __fish_profile_on_variable fish_profile "'$fish_profile'"

end


function __fish_profile_on_fish_profile_private_mode --on-variable fish_profile_private_mode
    __fish_profile_on_variable fish_profile_private_mode "'$fish_profile_private_mode'"
end


# One Function to rule them all ... and in the darkness bind them
function __fish_profile_on_variable

    if set -q __fish_profile_debug
        echo -- -- __fish_profile_on_variable $argv "
    __fish_private_mode_settable  - '$__fish_private_mode_settable'
    fish_history                  - '$fish_history'
    fish_private_mode             - '$fish_private_mode'
    fish_profile                  - '$fish_profile'
    fish_profile_private_mode     - '$fish_profile_private_mode'" >&2
    end

    if set -gq __fish_private_mode_settable

        if test "$fish_history" != "$fish_profile"
            set -g fish_history $fish_profile
        end

        if set -gq fish_profile_private_mode && not set -gq fish_private_mode
            set -g fish_private_mode 1
        else if not set -gq fish_profile_private_mode && set -gq fish_private_mode
            set -ge fish_private_mode
        end

    else

        if set -gq fish_profile_private_mode

            set -q __fish_profile_debug
            and set -l verbose_flag --verbose

            set -l fh private_"$fish_profile"_$fish_pid
            if test "$fish_history" != $fh
                set -g fish_history $fh
            end

            set -l hfile $__fish_user_data_dir/"$fish_profile"_history
            set -l private_hfile $__fish_user_data_dir/"$fish_history"_history

            if test -f $hfile -a ! -f $private_hfile
                cp $verbose_flag $hfile $private_hfile
            end

            set -l fn __fish_profile_rm_private_history_"$fish_profile"
            if not functions -q $fn
                function $fn -e fish_exit -V verbose_flag -V private_hfile
                    if test -f $private_hfile
                        rm $verbose_flag $private_hfile
                    end
                end
            end

        else

            if test "$fish_history" != "$fish_profile"
                set -g fish_history $fish_profile
            end

        end

    end

    # Helpful if used in a key binding
    if status is-interactive
        commandline -f repaint
    end

end
