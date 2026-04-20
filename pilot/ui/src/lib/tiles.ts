export type TileLeaf = {
  type: 'leaf'
  id: string
  scope: string[]
  history: string[][]
  mode: string
}

export type TileSplit = {
  type: 'split'
  id: string
  direction: 'horizontal' | 'vertical'
  ratio: number
  children: [TileNode, TileNode]
}

export type TileNode = TileLeaf | TileSplit
