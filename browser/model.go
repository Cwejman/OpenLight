package main

import (
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/openlight/browser/nav"
	"github.com/openlight/browser/ol"
	"github.com/openlight/browser/ui"
)

type mode int

const (
	modeNormal mode = iota
	modeDrop
	modePull
)

type panel int

const (
	panelDims panel = iota
	panelChunks
)

type navLevel int

const (
	levelEntry navLevel = iota
	levelInsideDim
	levelInsideChunk
)

type memberSide int

const (
	sideInstance memberSide = iota
	sideRelates
)

type model struct {
	width      int
	height     int
	client     *ol.Client
	scope      *ol.ScopeResponse
	err        error
	cursor     int
	colorMap   map[string]int // dimension name → color index
	mode       mode
	pullInput  string // text input for pull mode
	loading    bool
	showDims    bool
	showChunks  bool
	focus       panel          // which panel has focus
	chunks      []ol.ChunkItem // chunks for current view
	chunkCounts ol.ChunkCounts
	history     *nav.History
	navLevel    navLevel
	side        memberSide // instance or relates when inside an element
	subCursor   int        // cursor for sub-items inside an element
}

// scopeMsg carries the result of an async scope fetch.
type scopeMsg struct {
	resp *ol.ScopeResponse
	err  error
}

// chunksMsg carries the result of an async chunks fetch.
type chunksMsg struct {
	items  []ol.ChunkItem
	counts ol.ChunkCounts
	err    error
}

// clientReadyMsg is sent once the system is discovered.
type clientReadyMsg struct {
	client *ol.Client
	resp   *ol.ScopeResponse
	err    error
}

func newModel() model {
	return model{
		colorMap: make(map[string]int),
		showDims: true,
	}
}

func (m model) Init() tea.Cmd {
	return func() tea.Msg {
		systemDir, err := findSystem(".")
		if err != nil {
			return clientReadyMsg{err: err}
		}
		client := &ol.Client{DBPath: dbPath(systemDir)}
		resp, err := client.Scope()
		return clientReadyMsg{client: client, resp: resp, err: err}
	}
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height

	case clientReadyMsg:
		m.loading = false
		if msg.err != nil {
			m.err = msg.err
			return m, nil
		}
		m.client = msg.client
		m.scope = msg.resp
		m.cursor = 0
		m.history = nav.NewHistory(msg.resp.Scope)
		m.rebuildColorMap()

	case scopeMsg:
		m.loading = false
		if msg.err != nil {
			m.err = msg.err
			return m, nil
		}
		m.scope = msg.resp
		m.cursor = 0
		m.chunks = nil
		m.rebuildColorMap()
		// If chunks panel is visible, fetch chunks
		if m.showChunks {
			return m, m.fetchChunksCmd()
		}

	case chunksMsg:
		if msg.err == nil {
			m.chunks = msg.items
			m.chunkCounts = msg.counts
		}

	case tea.KeyMsg:
		if m.err != nil {
			return m, tea.Quit
		}

		switch m.mode {
		case modeDrop:
			return m.updateDrop(msg)
		case modePull:
			return m.updatePull(msg)
		default:
			return m.updateNormal(msg)
		}
	}
	return m, nil
}

func (m model) updateNormal(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	switch m.navLevel {
	case levelInsideDim:
		return m.updateInsideDim(msg)
	case levelInsideChunk:
		return m.updateInsideChunk(msg)
	}
	return m.updateEntryLevel(msg)
}

func (m model) updateEntryLevel(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "q", "ctrl+c":
		return m, tea.Quit
	case "j", "down":
		if m.scope != nil && m.cursor < len(m.scope.Dimensions)-1 {
			m.cursor++
			if m.showChunks {
				return m, m.fetchChunksCmd()
			}
		}
	case "k", "up":
		if m.cursor > 0 {
			m.cursor--
			if m.showChunks {
				return m, m.fetchChunksCmd()
			}
		}
	case "l", "right":
		// Enter the focused element
		if m.focus == panelDims && m.scope != nil && m.cursor < len(m.scope.Dimensions) {
			m.navLevel = levelInsideDim
			m.side = sideInstance
			m.subCursor = 0
		}
	case "a":
		return m.addFocusedDim()
	case "d":
		if m.scope != nil && len(m.scope.Scope) > 0 {
			m.mode = modeDrop
		}
	case "p":
		m.mode = modePull
		m.pullInput = ""
	case "tab":
		if m.showDims && m.showChunks {
			if m.focus == panelDims {
				m.focus = panelChunks
			} else {
				m.focus = panelDims
			}
		}
	case "u":
		if m.history != nil && m.history.CanUndo() {
			scope := m.history.Undo()
			return m.fetchScopeNoHistory(scope)
		}
	case "r":
		if m.history != nil && m.history.CanRedo() {
			scope := m.history.Redo()
			return m.fetchScopeNoHistory(scope)
		}
	case "t":
		if m.focus == panelDims {
			m.showChunks = !m.showChunks
			if m.showChunks && m.chunks == nil {
				return m, m.fetchChunksCmd()
			}
		} else {
			m.showDims = !m.showDims
		}
		if !m.showDims && m.focus == panelDims {
			m.focus = panelChunks
		}
		if !m.showChunks && m.focus == panelChunks {
			m.focus = panelDims
		}
	}
	return m, nil
}

func (m model) updateInsideDim(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	dim := m.scope.Dimensions[m.cursor]
	subItems := m.subItemsForDim(dim)

	switch msg.String() {
	case "q", "ctrl+c":
		return m, tea.Quit
	case "h", "left":
		if m.side == sideRelates {
			m.side = sideInstance
		} else {
			// At instance (leftmost) — exit to entry level
			m.navLevel = levelEntry
			m.subCursor = 0
		}
	case "l", "right":
		if m.side == sideInstance {
			m.side = sideRelates
		}
	case "j", "down":
		if m.subCursor < len(subItems)-1 {
			m.subCursor++
		}
	case "k", "up":
		if m.subCursor > 0 {
			m.subCursor--
		}
	case "a":
		// Add focused sub-dim to scope
		if m.subCursor < len(subItems) {
			dimName := subItems[m.subCursor]
			for _, s := range m.scope.Scope {
				if s == dimName {
					return m, nil
				}
			}
			newScope := append(append([]string{}, m.scope.Scope...), dimName)
			m.navLevel = levelEntry
			m.subCursor = 0
			return m.fetchScope(newScope)
		}
	}
	return m, nil
}

func (m model) updateInsideChunk(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	if m.chunks == nil || m.cursor >= len(m.chunks) {
		m.navLevel = levelEntry
		return m, nil
	}
	chunk := m.chunks[m.cursor]
	subItems := m.subItemsForChunk(chunk)

	switch msg.String() {
	case "q", "ctrl+c":
		return m, tea.Quit
	case "h", "left":
		if m.side == sideRelates {
			m.side = sideInstance
		} else {
			m.navLevel = levelEntry
			m.subCursor = 0
		}
	case "l", "right":
		if m.side == sideInstance {
			m.side = sideRelates
		}
	case "j", "down":
		if m.subCursor < len(subItems)-1 {
			m.subCursor++
		}
	case "k", "up":
		if m.subCursor > 0 {
			m.subCursor--
		}
	case "a":
		if m.subCursor < len(subItems) {
			dimName := subItems[m.subCursor]
			for _, s := range m.scope.Scope {
				if s == dimName {
					return m, nil
				}
			}
			newScope := append(append([]string{}, m.scope.Scope...), dimName)
			m.navLevel = levelEntry
			m.subCursor = 0
			return m.fetchScope(newScope)
		}
	}
	return m, nil
}

// subItemsForDim returns the navigable sub-items for a dim entry (connections + edges).
func (m model) subItemsForDim(dim ol.ScopeDim) []string {
	var items []string
	for _, c := range dim.Connections {
		items = append(items, c.Dim)
	}
	for _, e := range dim.Edges {
		items = append(items, e.Dim)
	}
	return items
}

// subItemsForChunk returns the navigable membership dims for a chunk.
func (m model) subItemsForChunk(chunk ol.ChunkItem) []string {
	if m.side == sideInstance {
		return chunk.Instance
	}
	return chunk.Relates
}

func (m model) updateDrop(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	key := msg.String()
	if len(key) == 1 && key[0] >= '0' && key[0] <= '9' {
		idx := int(key[0] - '0')
		if idx == 0 {
			idx = len(m.scope.Scope) - 1
		} else {
			idx--
		}
		if idx >= 0 && idx < len(m.scope.Scope) {
			newScope := make([]string, 0, len(m.scope.Scope)-1)
			for i, d := range m.scope.Scope {
				if i != idx {
					newScope = append(newScope, d)
				}
			}
			m.mode = modeNormal
			return m.fetchScope(newScope)
		}
	}
	m.mode = modeNormal
	return m, nil
}

func (m model) updatePull(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	switch msg.Type {
	case tea.KeyEscape:
		m.mode = modeNormal
		m.pullInput = ""
		return m, nil
	case tea.KeyEnter:
		if m.pullInput != "" {
			newScope := append(append([]string{}, m.scope.Scope...), m.pullInput)
			m.mode = modeNormal
			m.pullInput = ""
			return m.fetchScope(newScope)
		}
		m.mode = modeNormal
		return m, nil
	case tea.KeyBackspace:
		if len(m.pullInput) > 0 {
			m.pullInput = m.pullInput[:len(m.pullInput)-1]
		}
		return m, nil
	default:
		if msg.Type == tea.KeyRunes {
			m.pullInput += string(msg.Runes)
		}
		return m, nil
	}
}

func (m model) addFocusedDim() (tea.Model, tea.Cmd) {
	if m.scope == nil || m.cursor >= len(m.scope.Dimensions) {
		return m, nil
	}
	dimName := m.scope.Dimensions[m.cursor].Name
	for _, s := range m.scope.Scope {
		if s == dimName {
			return m, nil
		}
	}
	newScope := append(append([]string{}, m.scope.Scope...), dimName)
	return m.fetchScope(newScope)
}

func (m model) fetchScope(dims []string) (tea.Model, tea.Cmd) {
	m.loading = true
	if m.history != nil {
		m.history.Push(dims)
	}
	client := m.client
	return m, func() tea.Msg {
		if client == nil {
			return scopeMsg{err: nil}
		}
		resp, err := client.Scope(dims...)
		return scopeMsg{resp: resp, err: err}
	}
}

// fetchScopeNoHistory fetches a scope without pushing to history (for undo/redo).
func (m model) fetchScopeNoHistory(dims []string) (tea.Model, tea.Cmd) {
	m.loading = true
	client := m.client
	return m, func() tea.Msg {
		if client == nil {
			return scopeMsg{err: nil}
		}
		resp, err := client.Scope(dims...)
		return scopeMsg{resp: resp, err: err}
	}
}

// fetchChunksCmd returns a command that fetches chunks for the current view.
// If a dim is focused, fetches scope ∩ that dim. Otherwise, fetches all in-scope chunks.
func (m model) fetchChunksCmd() tea.Cmd {
	client := m.client
	if client == nil {
		return nil
	}
	dims := append([]string{}, m.scope.Scope...)
	if m.cursor < len(m.scope.Dimensions) {
		dims = append(dims, m.scope.Dimensions[m.cursor].Name)
	}
	return func() tea.Msg {
		resp, err := client.ScopeWithChunks(dims...)
		if err != nil {
			return chunksMsg{err: err}
		}
		return chunksMsg{items: resp.Chunks.Items, counts: resp.Chunks}
	}
}

func (m *model) rebuildColorMap() {
	m.colorMap = make(map[string]int)
	idx := 0
	for _, name := range m.scope.Scope {
		m.colorMap[name] = idx
		idx++
	}
	for _, dim := range m.scope.Dimensions {
		if _, exists := m.colorMap[dim.Name]; !exists {
			m.colorMap[dim.Name] = idx
			idx++
		}
		for _, c := range dim.Connections {
			if _, exists := m.colorMap[c.Dim]; !exists {
				m.colorMap[c.Dim] = idx
				idx++
			}
		}
		for _, e := range dim.Edges {
			if _, exists := m.colorMap[e.Dim]; !exists {
				m.colorMap[e.Dim] = idx
				idx++
			}
		}
	}
}

func (m model) View() string {
	if m.width == 0 {
		return ""
	}

	if m.err != nil {
		return "\n " + ui.Dim.Render(m.err.Error()) + "\n\n " + ui.Dim.Render("press any key to quit") + "\n"
	}

	if m.scope == nil {
		return "\n " + ui.Dim.Render("loading...") + "\n"
	}

	// Neither panel visible
	if !m.showDims && !m.showChunks {
		return m.viewNoPanels()
	}

	var content string
	if m.loading {
		content = " " + ui.Dim.Render("loading...")
	} else if m.showDims && m.showChunks {
		content = m.viewSplit()
	} else if m.showChunks {
		content = m.viewChunksOnly()
	} else {
		content = m.viewDimsOnly()
	}

	// Top bar + content + bottom bar
	var b strings.Builder
	b.WriteString(ui.TopBar(m.scope, m.colorMap))
	b.WriteString("\n\n\n")
	b.WriteString(content)

	rendered := b.String()
	lines := strings.Count(rendered, "\n") + 1
	if m.height > lines+3 {
		rendered += strings.Repeat("\n", m.height-lines-3)
	}
	rendered += "\n" + m.bottomBar() + "\n"

	return rendered
}

func (m model) viewDimsOnly() string {
	return ui.RenderDimsList(m.scope.Dimensions, m.colorMap, m.cursor, m.insideState())
}

func (m model) viewChunksOnly() string {
	if m.chunks == nil {
		return ui.Dim.Render(" loading chunks...")
	}
	return ui.RenderChunksList(m.chunks, m.colorMap, m.chunkCounts)
}

func (m model) viewSplit() string {
	left := ui.RenderDimsList(m.scope.Dimensions, m.colorMap, m.cursor, m.insideState())
	var right string
	if m.chunks == nil {
		right = ui.Dim.Render("loading chunks...")
	} else {
		right = ui.RenderChunksList(m.chunks, m.colorMap, m.chunkCounts)
	}
	return ui.MergePanels(left, right)
}

func (m model) viewNoPanels() string {
	var b strings.Builder
	b.WriteString(ui.TopBar(m.scope, m.colorMap))
	b.WriteString("\n\n")

	// Center message
	msg := ui.Dim.Render("Press t to toggle a panel.")
	b.WriteString("\n " + msg)

	rendered := b.String()
	lines := strings.Count(rendered, "\n") + 1
	if m.height > lines+3 {
		rendered += strings.Repeat("\n", m.height-lines-3)
	}
	rendered += "\n" + m.bottomBar() + "\n"
	return rendered
}

func (m model) insideState() *ui.InsideState {
	if m.navLevel == levelInsideDim {
		side := 0
		if m.side == sideRelates {
			side = 1
		}
		return &ui.InsideState{Active: true, Side: side, SubCursor: m.subCursor}
	}
	return nil
}

func (m model) bottomBar() string {
	switch m.mode {
	case modeDrop:
		return ui.DropBar(m.scope.Scope, m.colorMap)
	case modePull:
		return ui.PullBar(m.pullInput)
	default:
		return ui.BottomBar()
	}
}
