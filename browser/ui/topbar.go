package ui

import (
	"fmt"
	"strings"

	"github.com/openlight/browser/ol"
)

// TopBar renders the scope bar with scope dims and aggregate counts.
func TopBar(resp *ol.ScopeResponse, colorMap map[string]int) string {
	if len(resp.Scope) == 0 {
		return " " + Dim.Render("{}")
	}

	var parts []string
	for _, name := range resp.Scope {
		idx, ok := colorMap[name]
		if !ok {
			idx = 0
		}
		parts = append(parts, BoldDimName(name, idx))
	}
	scope := strings.Join(parts, Dim.Render(", "))

	counts := fmt.Sprintf("%d", resp.Chunks.InScope)

	return " " + scope + "  " + Light.Render(counts)
}
