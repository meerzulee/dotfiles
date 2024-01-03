complete -c fish-profile -l help -d "Show this help message and exit"
complete -c fish-profile -s p -l prune -d "Prune orphaned private history files"
complete -c fish-profile -s u -l use -d "Switch to PROFILE in current session"

function __fish_profile_completion_names
    # Parse existing history files for names of previously used profiles
    for f in $__fish_user_data_dir/*_history
        printf "%s\n" (
            string replace -r '.*/(.*)_history$' '$1' $f |
            string match -rv '^private_'
        )
    end
end

complete -c fish-profile -xa "(__fish_profile_completion_names)"
