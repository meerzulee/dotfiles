return {
  "nvim-telescope/telescope.nvim",
  opts = {
    defaults = {
      file_ignore_patterns = {
        "node_modules",
        ".git",
        "dist",
        "build",
        ".next",
        "coverage",
        ".cache",
        "%.lock",
      },
    },
    pickers = {
      find_files = {
        hidden = true,
        find_command = { "rg", "--files", "--hidden", "-g", "!**/.git/*", "-g", "!**/node_modules/*" },
      },
    },
  },
}
