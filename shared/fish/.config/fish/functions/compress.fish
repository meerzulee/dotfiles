function compress
    if test (count $argv) -lt 1
        echo "usage: compress <dir>"
        return 1
    end

    set -l path "$argv[1]"
    # remove a single trailing slash if present
    set -l dir (string replace -r '/$' '' -- "$path")

    tar -czf "$dir.tar.gz" -- "$dir"
end
