package ui

import (
	"regexp"
	"strings"
)

const (
	LeftWidth = 48
	Gap       = 5
)

var ansiRE = regexp.MustCompile(`\x1b\[[0-9;]*m`)

// VisLen returns the visible length of a string (stripping ANSI codes).
func VisLen(s string) int {
	return len(ansiRE.ReplaceAllString(s, ""))
}

// Pad pads a string to the given visible width.
func Pad(s string, width int) string {
	diff := width - VisLen(s)
	if diff > 0 {
		return s + strings.Repeat(" ", diff)
	}
	return s
}

// MergePanels merges left and right panel lines side by side.
func MergePanels(left, right string) string {
	leftLines := strings.Split(left, "\n")
	rightLines := strings.Split(right, "\n")

	max := len(leftLines)
	if len(rightLines) > max {
		max = len(rightLines)
	}

	var lines []string
	gap := strings.Repeat(" ", Gap)
	for i := 0; i < max; i++ {
		l := ""
		if i < len(leftLines) {
			l = leftLines[i]
		}
		r := ""
		if i < len(rightLines) {
			r = rightLines[i]
		}
		lines = append(lines, Pad(l, LeftWidth)+gap+r)
	}

	return strings.Join(lines, "\n")
}
