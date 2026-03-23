package ui

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"
	"github.com/openlight/browser/ol"
)

// InsideState describes the navigation state when inside an element.
type InsideState struct {
	Active    bool // whether we're inside this element
	Side      int  // 0=instance, 1=relates
	SubCursor int  // which sub-item is focused
}

// RenderDimEntry renders a single dimension entry for the dims panel.
func RenderDimEntry(dim ol.ScopeDim, colorMap map[string]int, selected bool, inside InsideState) string {
	var lines []string

	idx := colorMap[dim.Name]

	// Name line with cursor indicator
	var nameLine string
	if selected {
		nameLine = " " + Bold.Render("▸") + " " + BoldDimName(dim.Name, idx) + "  " + Light.Render(fmt.Sprintf("%d", dim.Shared))
	} else {
		nameLine = "   " + DimName(dim.Name, idx) + "  " + Light.Render(fmt.Sprintf("%d", dim.Shared))
	}
	lines = append(lines, nameLine)

	// Instance/relates toggle — only shown when inside
	if inside.Active {
		instLabel := BoldWhite.Render("instance") + " " + Light.Render(fmt.Sprintf("%d", dim.Instance))
		relLabel := Dim.Render("relates") + " " + Dim.Render(fmt.Sprintf("%d", dim.Relates))
		if inside.Side == 1 {
			instLabel = Dim.Render("instance") + " " + Dim.Render(fmt.Sprintf("%d", dim.Instance))
			relLabel = BoldWhite.Render("relates") + " " + Light.Render(fmt.Sprintf("%d", dim.Relates))
		}
		lines = append(lines, "     "+instLabel+"  "+relLabel)
	}

	// Sub-connections
	if len(dim.Connections) > 0 {
		lines = append(lines, "")
		for ci, c := range dim.Connections {
			cIdx := colorMap[c.Dim]
			total := c.Instance + c.Relates
			entry := DimName(c.Dim, cIdx) + " " + Dim.Render(fmt.Sprintf("%d", total))
			if inside.Active && inside.SubCursor == ci {
				entry = "   ▸ " + entry
			} else if inside.Active {
				entry = "     " + entry
			} else {
				// At entry level, show inline
				if ci == 0 {
					// Will be joined below
				}
			}
			if inside.Active {
				lines = append(lines, entry)
			}
		}
		if !inside.Active {
			var conns []string
			for _, c := range dim.Connections {
				cIdx := colorMap[c.Dim]
				total := c.Instance + c.Relates
				conns = append(conns, DimName(c.Dim, cIdx)+" "+Dim.Render(fmt.Sprintf("%d", total)))
			}
			lines = append(lines, "     "+strings.Join(conns, "  "+Separator+"  "))
		}
	}

	// Edges (outliers)
	if len(dim.Edges) > 0 {
		edgeOffset := len(dim.Connections)
		if inside.Active {
			lines = append(lines, "")
		}
		for ei, e := range dim.Edges {
			eIdx := colorMap[e.Dim]
			total := e.Instance + e.Relates
			edge := lipgloss.NewStyle().Faint(true).Render(DimName(e.Dim, eIdx)) +
				" " + Dim.Render(fmt.Sprintf("%d", total))
			if inside.Active && inside.SubCursor == edgeOffset+ei {
				edge = "   ▸ " + edge
			} else if inside.Active {
				edge = "     " + edge
			}
			if inside.Active {
				lines = append(lines, edge)
			}
		}
		if !inside.Active {
			var edges []string
			for _, e := range dim.Edges {
				eIdx := colorMap[e.Dim]
				total := e.Instance + e.Relates
				edge := lipgloss.NewStyle().Faint(true).Render(DimName(e.Dim, eIdx)) +
					" " + Dim.Render(fmt.Sprintf("%d", total))
				edges = append(edges, edge)
			}
			lines = append(lines, "     "+strings.Join(edges, "  "+Separator+"  "))
		}
	}

	return strings.Join(lines, "\n")
}

// RenderDimsList renders the full dimensions panel.
func RenderDimsList(dims []ol.ScopeDim, colorMap map[string]int, cursor int, inside *InsideState) string {
	var sections []string
	for i, dim := range dims {
		var is InsideState
		if inside != nil && i == cursor {
			is = *inside
		}
		sections = append(sections, RenderDimEntry(dim, colorMap, i == cursor, is))
	}
	return strings.Join(sections, "\n\n\n")
}
