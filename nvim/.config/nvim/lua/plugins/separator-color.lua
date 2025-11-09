return {
  {
    "LazyVim/LazyVim",
    opts = function(_, opts)
      -- Function to update separator colors based on theme
      local function update_separator_colors()
        local is_dark = vim.o.background == "dark"
        local color = is_dark and "#ffffff" or "#000000"

        -- Convert hex to number
        local color_num = tonumber(color:sub(2), 16)

        -- Apply to window separators
        vim.api.nvim_set_hl(0, "WinSeparator", { fg = color_num })
        vim.api.nvim_set_hl(0, "VertSplit", { fg = color_num })
      end

      -- Set up autocmds to watch for theme changes
      vim.api.nvim_create_autocmd({
        "ColorScheme", -- When colorscheme changes
        "OptionSet", -- When background option changes
        "FocusGained", -- When Neovim regains focus (catches external changes)
        "VimEnter", -- When Neovim starts
      }, {
        callback = function(ev)
          -- Only respond to background changes if OptionSet
          if ev.event == "OptionSet" and ev.match ~= "background" then
            return
          end
          -- Small delay to ensure theme is fully loaded
          vim.defer_fn(update_separator_colors, 10)
        end,
        desc = "Update window separator colors to contrast with theme",
      })

      -- Initial setup
      vim.defer_fn(update_separator_colors, 50)
    end,
  },
}
