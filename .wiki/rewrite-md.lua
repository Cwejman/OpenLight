-- Rewrite [foo](bar.md) → [foo](bar.html) and [foo](bar.md#anchor) → [foo](bar.html#anchor)
-- Only touches relative links; leaves absolute URLs (http://, https://, mailto:, #anchor) alone.

function Link(el)
  local t = el.target
  if t:match("^https?://") or t:match("^mailto:") or t:match("^#") or t:match("^/") then
    return el
  end
  el.target = t:gsub("%.md$", ".html"):gsub("%.md#", ".html#")
  return el
end
