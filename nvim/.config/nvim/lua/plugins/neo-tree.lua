return {
  "nvim-neo-tree/neo-tree.nvim",
  opts = {
    filesystem = {
      filtered_items = {
        hide_dotfiles = false, -- show dotfiles
        hide_gitignored = false, -- optional: show .gitignored files
        hide_hidden = false, -- on Windows: show hidden files too
      },
    },
  },
}
