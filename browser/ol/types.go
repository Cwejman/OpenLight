package ol

// ScopeResponse is the JSON output of `ol scope`.
type ScopeResponse struct {
	Scope      []string    `json:"scope"`
	Head       string      `json:"head"`
	Chunks     ChunkCounts `json:"chunks"`
	Dimensions []ScopeDim  `json:"dimensions"`
}

type ChunkCounts struct {
	Total    int         `json:"total"`
	InScope  int         `json:"in_scope"`
	Instance int         `json:"instance"`
	Relates  int         `json:"relates"`
	Items    []ChunkItem `json:"items,omitempty"`
}

type ScopeDim struct {
	Name        string       `json:"name"`
	Shared      int          `json:"shared"`
	Instance    int          `json:"instance"`
	Relates     int          `json:"relates"`
	Connections []Connection `json:"connections"`
	Edges       []Connection `json:"edges"`
}

type Connection struct {
	Dim      string `json:"dim"`
	Instance int    `json:"instance"`
	Relates  int    `json:"relates"`
}

// ChunkItem is a chunk returned with --chunks.
type ChunkItem struct {
	ID       string            `json:"id"`
	Text     string            `json:"text"`
	KV       map[string]string `json:"kv"`
	Instance []string          `json:"instance"`
	Relates  []string          `json:"relates"`
}
