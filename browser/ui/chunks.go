package ui

import (
	"fmt"
	"sort"
	"strings"

	"github.com/openlight/browser/ol"
)

// RenderChunkEntry renders a single chunk.
func RenderChunkEntry(chunk ol.ChunkItem, colorMap map[string]int) string {
	var lines []string

	// Text content
	lines = append(lines, Light.Render(chunk.Text))

	// Key/value pairs — clean table, key in white, value in gray
	if len(chunk.KV) > 0 {
		lines = append(lines, "")
		// Sort keys for stable output
		keys := make([]string, 0, len(chunk.KV))
		for k := range chunk.KV {
			keys = append(keys, k)
		}
		sort.Strings(keys)

		// Find max key length for alignment
		maxKey := 0
		for _, k := range keys {
			if len(k) > maxKey {
				maxKey = len(k)
			}
		}

		for _, k := range keys {
			padding := strings.Repeat(" ", maxKey-len(k)+1)
			lines = append(lines, Dim.Render(k)+padding+Light.Render(chunk.KV[k]))
		}
	}

	// Memberships
	if len(chunk.Instance) > 0 || len(chunk.Relates) > 0 {
		lines = append(lines, "")
		if len(chunk.Instance) > 0 {
			var dims []string
			for _, d := range chunk.Instance {
				idx := colorMap[d]
				dims = append(dims, DimName(d, idx))
			}
			lines = append(lines, Dim.Render("instance")+" "+strings.Join(dims, " "))
		}
		if len(chunk.Relates) > 0 {
			var dims []string
			for _, d := range chunk.Relates {
				idx := colorMap[d]
				dims = append(dims, DimName(d, idx))
			}
			lines = append(lines, Dim.Render("relates")+"  "+strings.Join(dims, " "))
		}
	}

	return strings.Join(lines, "\n")
}

// RenderChunksList renders all chunks.
func RenderChunksList(chunks []ol.ChunkItem, colorMap map[string]int, counts ol.ChunkCounts) string {
	var b strings.Builder

	// Header with counts
	header := strings.Repeat(" ", 20) +
		Light.Render(fmt.Sprintf("%d", counts.InScope)) + " " +
		Dim.Render("(instance ") + Light.Render(fmt.Sprintf("%d", counts.Instance)) +
		Dim.Render("  relates ") + Light.Render(fmt.Sprintf("%d", counts.Relates)) + Dim.Render(")")
	b.WriteString(header)
	b.WriteString("\n\n\n")

	for i, chunk := range chunks {
		b.WriteString(RenderChunkEntry(chunk, colorMap))
		if i < len(chunks)-1 {
			b.WriteString("\n\n\n")
		}
	}

	return b.String()
}

