package ui

import "fmt"

// BottomBar renders the keybind hints for normal mode.
func BottomBar() string {
	return " " + BoldWhite.Render("hjkl") + Dim.Render("/") +
		BoldWhite.Render("tab") + Dim.Render(" navigate  ") +
		BoldWhite.Render("t") + Dim.Render("oggle  ") +
		BoldWhite.Render("a") + Dim.Render("dd  ") +
		BoldWhite.Render("d") + Dim.Render("rop  ") +
		BoldWhite.Render("p") + Dim.Render("ull  ") +
		BoldWhite.Render("u") + Dim.Render("ndo  ") +
		BoldWhite.Render("r") + Dim.Render("edo  ") +
		BoldWhite.Render("?") + Dim.Render("help  ") +
		BoldWhite.Render("q") + Dim.Render("uit")
}

// DropBar renders the drop mode bar with numbered scope dimensions.
// 0 = last added (easy pop). 1-9 = position.
func DropBar(scope []string, colorMap map[string]int) string {
	s := " " + Dim.Render("drop: ")
	for i, name := range scope {
		num := i + 1
		if i == len(scope)-1 {
			num = 0
		}
		idx := colorMap[name]
		s += BoldWhite.Render(fmt.Sprintf("%d", num)) + Dim.Render("=") + DimName(name, idx) + "  "
	}
	s += Dim.Render("(any other key cancels)")
	return s
}

// PullBar renders the pull mode bar with text input.
func PullBar(input string) string {
	return " " + Dim.Render("pull: ") + Light.Render(input) + BoldWhite.Render("_") +
		"  " + Dim.Render("enter to add, esc to cancel")
}
