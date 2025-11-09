return {
  "mg979/vim-visual-multi",
  branch = "master",
  event = "VeryLazy",
  init = function()
    vim.g.VM_maps = {
      ["Find Under"] = "<C-n>",
      ["Find Subword Under"] = "<C-n>",
      ["Select All"] = "<leader>ma",
      ["Visual All"] = "<leader>mA",
      ["Add Cursor Down"] = "<C-Down>",
      ["Add Cursor Up"] = "<C-Up>",
    }
  end,
  config = function()
    local wk = require("which-key")
    wk.add({
      { "<leader>m", group = "󰘪 Multi-cursor" },
      { "<leader>ma", "<Plug>(VM-Select-All)", desc = "Select all occurrences" },
      { "<leader>mA", "<Plug>(VM-Visual-All)", desc = "Visual select all" },
      { "<leader>mn", "<Plug>(VM-Find-Under)", desc = "Find under cursor" },
      { "<leader>m/", "<Plug>(VM-Start-Regex-Search)", desc = "Regex search" },
      { "<leader>m\\", "<Plug>(VM-Add-Cursor-At-Pos)", desc = "Add cursor at pos" },
    })
  end,
}
