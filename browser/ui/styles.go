package ui

import "github.com/charmbracelet/lipgloss"

// Positional palette for dimension colors.
var DimColors = []lipgloss.Color{
	lipgloss.Color("14"), // cyan
	lipgloss.Color("10"), // green
	lipgloss.Color("12"), // blue
	lipgloss.Color("11"), // yellow
	lipgloss.Color("13"), // magenta
	lipgloss.Color("9"),  // red
	lipgloss.Color("15"), // white
}

// DimColor returns the color for a dimension by its index in the palette.
func DimColor(index int) lipgloss.Color {
	return DimColors[index%len(DimColors)]
}

var (
	Bold      = lipgloss.NewStyle().Bold(true)
	Dim       = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
	Light     = lipgloss.NewStyle().Foreground(lipgloss.Color("7"))
	BoldWhite = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("15"))
	Separator = lipgloss.NewStyle().Foreground(lipgloss.Color("8")).Render("·")
)

// DimName renders a dimension name in its assigned color.
func DimName(name string, colorIndex int) string {
	return lipgloss.NewStyle().
		Foreground(DimColor(colorIndex)).
		Render(name)
}

// BoldDimName renders a bold dimension name in its assigned color.
func BoldDimName(name string, colorIndex int) string {
	return lipgloss.NewStyle().
		Bold(true).
		Foreground(DimColor(colorIndex)).
		Render(name)
}
