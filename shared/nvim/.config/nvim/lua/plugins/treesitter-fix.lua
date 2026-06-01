-- Fix for Treesitter JSX/TSX parsing issues
return {
  {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    opts = function(_, opts)
      -- Ensure required parsers are installed
      vim.list_extend(opts.ensure_installed or {}, {
        "javascript",
        "typescript",
        "tsx",
        "html",
        "css",
        "json",
        "markdown",
        "markdown_inline",
      })

      -- Configure highlight settings
      opts.highlight = vim.tbl_deep_extend("force", opts.highlight or {}, {
        enable = true,
        additional_vim_regex_highlighting = { "markdown" },
      })

      -- Configure indent settings
      opts.indent = {
        enable = true,
        disable = { "yaml", "python" }, -- Some languages have better built-in indentation
      }


      return opts
    end,
    config = function(_, opts)
      -- Safely setup treesitter configs
      local ok, ts_configs = pcall(require, "nvim-treesitter.configs")
      if ok then
        ts_configs.setup(opts)
      end

      -- Fix for JSX/TSX component recognition
      vim.treesitter.language.register("tsx", "typescriptreact")
      vim.treesitter.language.register("tsx", "javascriptreact")

      -- Set up proper filetype detection
      vim.filetype.add({
        extension = {
          jsx = "javascriptreact",
          tsx = "typescriptreact",
        },
      })

      -- Clear any problematic query cache
      vim.schedule(function()
        pcall(vim.cmd, 'TSBufDisable highlight')
        pcall(vim.cmd, 'TSBufEnable highlight')
      end)
    end,
  },

  -- Add nvim-treesitter-context for better context awareness
  {
    "nvim-treesitter/nvim-treesitter-context",
    event = "BufReadPre",
    config = function()
      require("treesitter-context").setup({
        enable = true,
        max_lines = 3,
        min_window_height = 0,
        line_numbers = true,
        multiline_threshold = 20,
        trim_scope = "outer",
        mode = "cursor",
        separator = nil,
        zindex = 20,
      })
    end,
  },
}