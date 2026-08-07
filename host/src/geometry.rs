//! Tile geometry — pure. From `@md/spec/host.md` §Tile Geometry:
//! binary split tree; `ratio` is the seq-first child's share of the split
//! axis, clamped inside (0, 1). The walk is a pure function of
//! (tree, viewport, spacing) → leaf rectangles; spacing values are
//! parameters because the visual tokens are an open (host.md §What Is Open).
//! No interaction here — the direct-manipulation grammar is spec-gated.

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Direction {
    Horizontal,
    Vertical,
}

/// The parsed tile tree. `first` is the seq-first child.
#[derive(Debug, Clone, PartialEq)]
pub enum Tile {
    Leaf {
        id: String,
    },
    Split {
        id: String,
        direction: Direction,
        ratio: f64,
        first: Box<Tile>,
        second: Box<Tile>,
    },
}

/// The walk-first leaf — where boot lands its tile run. The tiling verbs
/// evolve the tree (a close may collapse the seeded first leaf away), so
/// "first" is the current tree's word, never a remembered id (boot.rs step 10).
pub fn first_leaf(tile: &Tile) -> &str {
    match tile {
        Tile::Leaf { id } => id,
        Tile::Split { first, .. } => first_leaf(first),
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Rect {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

/// Spacing tokens as parameters — values settle by eye later (host.md open).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Spacing {
    /// Around the whole tiling area.
    pub padding: f64,
    /// Between sibling tiles.
    pub gap: f64,
}

/// A naked surface strip — the sidebar (host.md §Sidebar, boot step 10):
/// positioned directly on the background, *outside* tile geometry, so the
/// tiling area shifts to make room. Width is a parameter like [`Spacing`];
/// the value settles by eye (host.md §What Is Open, *Visual tokens*).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Strip {
    /// The visible column — what the tiling area is displaced by.
    pub width: f64,
    pub bleed: Bleed,
}

/// How far the strip's webview reaches past its visible column. A webview
/// clips its own content, and two things the strip owns live outside the
/// column: the shadow each running item casts, and the platform's overlay
/// scrollbar. So the webview is given that room, and the program insets its
/// column by the same numbers — the column stays exactly where it was, and the
/// tiling area never learns about the bleed.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Bleed {
    pub left: f64,
    pub top: f64,
    pub right: f64,
    pub bottom: f64,
}

impl Bleed {
    pub const NONE: Bleed = Bleed { left: 0.0, top: 0.0, right: 0.0, bottom: 0.0 };
}

#[derive(Debug, Clone, PartialEq)]
pub struct LeafRect {
    pub id: String,
    pub rect: Rect,
}

/// Reserve the left strip: returns (the strip webview's rect, the viewport left
/// for tiling). The column sits inside the window's padding — text on the
/// canvas, no panel — and the tiling viewport begins where the column ends, so
/// [`walk`]'s own padding becomes the gap between the strip and the first tile.
/// The returned rect is the column grown by [`Bleed`]: the surface is larger
/// than the column, the reservation is not. A zero-width strip reserves nothing
/// and leaves the viewport exactly as given.
pub fn reserve(viewport: Rect, strip: Strip, spacing: Spacing) -> (Rect, Rect) {
    let width = strip
        .width
        .clamp(0.0, (viewport.width - 2.0 * spacing.padding).max(0.0));
    if width == 0.0 {
        return (Rect { width: 0.0, height: 0.0, ..viewport }, viewport);
    }
    let taken = spacing.padding + width;
    let bleed = strip.bleed;
    (
        Rect {
            x: viewport.x + spacing.padding - bleed.left,
            y: viewport.y + spacing.padding - bleed.top,
            width: width + bleed.left + bleed.right,
            height: (viewport.height - 2.0 * spacing.padding).max(0.0) + bleed.top + bleed.bottom,
        },
        Rect { x: viewport.x + taken, width: viewport.width - taken, ..viewport },
    )
}

/// Walk the tree: viewport shrunk by `padding`, each split divided along its
/// axis with `gap` between the children. Leaves come back in seq order
/// (depth-first, seq-first child first).
pub fn walk(tree: &Tile, viewport: Rect, spacing: Spacing) -> Vec<LeafRect> {
    let padded = Rect {
        x: viewport.x + spacing.padding,
        y: viewport.y + spacing.padding,
        width: viewport.width - 2.0 * spacing.padding,
        height: viewport.height - 2.0 * spacing.padding,
    };
    let mut leaves = Vec::new();
    place(tree, padded, spacing.gap, &mut leaves);
    leaves
}

fn place(tile: &Tile, rect: Rect, gap: f64, out: &mut Vec<LeafRect>) {
    match tile {
        Tile::Leaf { id } => out.push(LeafRect { id: id.clone(), rect }),
        Tile::Split { direction, ratio, first, second, .. } => {
            let ratio = clamp_ratio(*ratio);
            match direction {
                Direction::Horizontal => {
                    let available = rect.width - gap;
                    let first_width = ratio * available;
                    place(first, Rect { width: first_width, ..rect }, gap, out);
                    let second_rect =
                        Rect { x: rect.x + first_width + gap, width: available - first_width, ..rect };
                    place(second, second_rect, gap, out);
                }
                Direction::Vertical => {
                    let available = rect.height - gap;
                    let first_height = ratio * available;
                    place(first, Rect { height: first_height, ..rect }, gap, out);
                    let second_rect =
                        Rect { y: rect.y + first_height + gap, height: available - first_height, ..rect };
                    place(second, second_rect, gap, out);
                }
            }
        }
    }
}

// "Clamped inside (0, 1)" — open interval; the spec names no margin. EPSILON
// is the smallest clamp that keeps both children strictly inside the axis
// after multiplication (a subnormal floor would round back to the bound).
// A visible minimum belongs to the direct-manipulation layer (spec-gated).
fn clamp_ratio(ratio: f64) -> f64 {
    ratio.clamp(f64::EPSILON, 1.0 - f64::EPSILON)
}

// --- Chunk-shaped parse layer ---------------------------------------------
// Shaped after host.md's tile chunk bodies; independent of any db code.

/// A `host/tile` chunk body: split `{ direction, ratio }` or empty leaf.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum TileBody {
    Split { direction: Direction, ratio: f64 },
    Leaf,
}

#[derive(Debug, Clone, PartialEq)]
pub struct TileChunk {
    pub id: String,
    pub body: TileBody,
}

/// An instance placement of a tile on a tab or parent tile; seq chooses side.
#[derive(Debug, Clone, PartialEq)]
pub struct Placement {
    pub tile: String,
    pub scope: String,
    pub seq: i64,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ParseError {
    /// The tab has no tile placed on it.
    NoRoot,
    /// The tab has more than one tile placed on it.
    MultipleRoots,
    /// A placement names a tile chunk that wasn't given.
    MissingChunk(String),
    /// A split tile must hold exactly two children.
    SplitChildren { id: String, count: usize },
    /// A leaf tile holds no children.
    LeafChildren(String),
}

/// Placements + tile chunk bodies → tree, rooted at the single tile placed
/// on `tab`. Children order by seq; placements on other scopes are ignored.
pub fn parse(tab: &str, tiles: &[TileChunk], placements: &[Placement]) -> Result<Tile, ParseError> {
    let roots = children_of(tab, placements);
    match roots.as_slice() {
        [] => Err(ParseError::NoRoot),
        [root] => build(&root.tile, tiles, placements),
        _ => Err(ParseError::MultipleRoots),
    }
}

fn children_of<'a>(scope: &str, placements: &'a [Placement]) -> Vec<&'a Placement> {
    let mut children: Vec<&Placement> = placements.iter().filter(|p| p.scope == scope).collect();
    children.sort_by_key(|p| p.seq);
    children
}

fn build(id: &str, tiles: &[TileChunk], placements: &[Placement]) -> Result<Tile, ParseError> {
    let chunk = tiles
        .iter()
        .find(|t| t.id == id)
        .ok_or_else(|| ParseError::MissingChunk(id.to_string()))?;
    let children = children_of(id, placements);
    match chunk.body {
        TileBody::Leaf if children.is_empty() => Ok(Tile::Leaf { id: id.to_string() }),
        TileBody::Leaf => Err(ParseError::LeafChildren(id.to_string())),
        TileBody::Split { direction, ratio } => match children.as_slice() {
            [first, second] => Ok(Tile::Split {
                id: id.to_string(),
                direction,
                ratio,
                first: Box::new(build(&first.tile, tiles, placements)?),
                second: Box::new(build(&second.tile, tiles, placements)?),
            }),
            _ => Err(ParseError::SplitChildren { id: id.to_string(), count: children.len() }),
        },
    }
}

#[cfg(test)]
mod walk_tests {
    use super::*;

    fn leaf(id: &str) -> Tile {
        Tile::Leaf { id: id.into() }
    }

    fn split(id: &str, direction: Direction, ratio: f64, first: Tile, second: Tile) -> Tile {
        Tile::Split { id: id.into(), direction, ratio, first: Box::new(first), second: Box::new(second) }
    }

    const VIEWPORT: Rect = Rect { x: 0.0, y: 0.0, width: 1000.0, height: 800.0 };
    const SPACING: Spacing = Spacing { padding: 10.0, gap: 6.0 };

    fn assert_rect(actual: Rect, expected: Rect) {
        let close = (actual.x - expected.x).abs() < 1e-9
            && (actual.y - expected.y).abs() < 1e-9
            && (actual.width - expected.width).abs() < 1e-9
            && (actual.height - expected.height).abs() < 1e-9;
        assert!(close, "expected {expected:?}, got {actual:?}");
    }

    #[test]
    fn single_leaf_fills_padded_viewport() {
        let rects = walk(&leaf("a"), VIEWPORT, SPACING);
        assert_eq!(rects.len(), 1);
        assert_eq!(rects[0].id, "a");
        assert_rect(rects[0].rect, Rect { x: 10.0, y: 10.0, width: 980.0, height: 780.0 });
    }

    #[test]
    fn horizontal_split_gives_seq_first_child_ratio_of_width() {
        let tree = split("s", Direction::Horizontal, 0.25, leaf("a"), leaf("b"));
        let rects = walk(&tree, VIEWPORT, SPACING);
        // width available to children: 980 - gap 6 = 974
        assert_rect(rects[0].rect, Rect { x: 10.0, y: 10.0, width: 0.25 * 974.0, height: 780.0 });
        assert_rect(
            rects[1].rect,
            Rect { x: 10.0 + 0.25 * 974.0 + 6.0, y: 10.0, width: 0.75 * 974.0, height: 780.0 },
        );
    }

    #[test]
    fn vertical_split_gives_seq_first_child_ratio_of_height() {
        let tree = split("s", Direction::Vertical, 0.6, leaf("a"), leaf("b"));
        let rects = walk(&tree, VIEWPORT, SPACING);
        // height available to children: 780 - gap 6 = 774
        assert_rect(rects[0].rect, Rect { x: 10.0, y: 10.0, width: 980.0, height: 0.6 * 774.0 });
        assert_rect(
            rects[1].rect,
            Rect { x: 10.0, y: 10.0 + 0.6 * 774.0 + 6.0, width: 980.0, height: 0.4 * 774.0 },
        );
    }

    #[test]
    fn gap_separates_siblings() {
        let tree = split("s", Direction::Horizontal, 0.5, leaf("a"), leaf("b"));
        let rects = walk(&tree, VIEWPORT, SPACING);
        let (a, b) = (rects[0].rect, rects[1].rect);
        assert!((b.x - (a.x + a.width) - SPACING.gap).abs() < 1e-9);
        assert!((a.width + SPACING.gap + b.width - 980.0).abs() < 1e-9);
    }

    #[test]
    fn nested_splits_compose() {
        // a | (b / c): horizontal root, second child vertically split.
        let tree = split(
            "root",
            Direction::Horizontal,
            0.5,
            leaf("a"),
            split("inner", Direction::Vertical, 0.5, leaf("b"), leaf("c")),
        );
        let rects = walk(&tree, VIEWPORT, SPACING);
        assert_eq!(rects.len(), 3);
        let w = (980.0 - 6.0) / 2.0; // 487
        let h = (780.0 - 6.0) / 2.0; // 387
        assert_rect(rects[0].rect, Rect { x: 10.0, y: 10.0, width: w, height: 780.0 });
        assert_rect(rects[1].rect, Rect { x: 10.0 + w + 6.0, y: 10.0, width: w, height: h });
        assert_rect(rects[2].rect, Rect { x: 10.0 + w + 6.0, y: 10.0 + h + 6.0, width: w, height: h });
    }

    #[test]
    fn ratio_clamped_above_zero() {
        let at_zero = walk(&split("s", Direction::Horizontal, 0.0, leaf("a"), leaf("b")), VIEWPORT, SPACING);
        let below = walk(&split("s", Direction::Horizontal, -0.5, leaf("a"), leaf("b")), VIEWPORT, SPACING);
        assert_eq!(at_zero, below, "everything below the bound clamps to the same layout");
        // clamped inside (0, 1): the seq-first child keeps a strictly positive share
        assert!(at_zero[0].rect.width > 0.0);
        assert!(at_zero[1].rect.width < 980.0 - SPACING.gap);
    }

    #[test]
    fn ratio_clamped_below_one() {
        let at_one = walk(&split("s", Direction::Vertical, 1.0, leaf("a"), leaf("b")), VIEWPORT, SPACING);
        let above = walk(&split("s", Direction::Vertical, 1.5, leaf("a"), leaf("b")), VIEWPORT, SPACING);
        assert_eq!(at_one, above, "everything above the bound clamps to the same layout");
        assert!(at_one[1].rect.height > 0.0);
        assert!(at_one[0].rect.height < 780.0 - SPACING.gap);
    }

    const STRIP: Strip = Strip { width: 200.0, bleed: Bleed::NONE };

    #[test]
    fn the_strip_stands_inside_the_padding_on_the_left() {
        let (strip, _) = reserve(VIEWPORT, STRIP, SPACING);
        assert_rect(strip, Rect { x: 10.0, y: 10.0, width: 200.0, height: 780.0 });
    }

    #[test]
    fn the_tiling_area_shifts_right_to_make_room() {
        let (_, tiling) = reserve(VIEWPORT, STRIP, SPACING);
        let rects = walk(&leaf("a"), tiling, SPACING);
        // The strip's right edge is 210; the walk's own padding is the gap.
        assert_rect(
            rects[0].rect,
            Rect { x: 220.0, y: 10.0, width: 1000.0 - 220.0 - 10.0, height: 780.0 },
        );
    }

    #[test]
    fn a_tile_never_overlaps_the_strip() {
        let (strip, tiling) = reserve(VIEWPORT, STRIP, SPACING);
        let tree = split("s", Direction::Horizontal, 0.5, leaf("a"), leaf("b"));
        for rect in walk(&tree, tiling, SPACING) {
            assert!(rect.rect.x >= strip.x + strip.width, "{:?} runs under the strip", rect);
        }
    }

    #[test]
    fn the_webview_grows_past_the_column_but_the_reservation_does_not() {
        let bleed = Bleed { left: 14.0, top: 10.0, right: 8.0, bottom: 10.0 };
        let (bled, tiling) = reserve(VIEWPORT, Strip { bleed, ..STRIP }, SPACING);
        let (column, plain) = reserve(VIEWPORT, STRIP, SPACING);

        // The surface reaches out by exactly the bleed…
        assert_rect(
            bled,
            Rect { x: column.x - 14.0, y: column.y - 10.0, width: 200.0 + 22.0, height: 780.0 + 20.0 },
        );
        // …and the tiling area is placed by the column alone, so a tile stands
        // where it stood before the strip was given room.
        assert_eq!(tiling, plain);
    }

    #[test]
    fn no_strip_leaves_the_viewport_untouched() {
        let (strip, tiling) = reserve(VIEWPORT, Strip { width: 0.0, bleed: Bleed::NONE }, SPACING);
        assert_eq!(tiling, VIEWPORT, "a program-less strip costs the tiling area nothing");
        assert_eq!(strip.width, 0.0);
        assert_eq!(
            walk(&leaf("a"), tiling, SPACING),
            walk(&leaf("a"), VIEWPORT, SPACING)
        );
    }

    #[test]
    fn a_strip_wider_than_the_window_still_leaves_the_padding() {
        let (strip, tiling) = reserve(VIEWPORT, Strip { width: 5_000.0, ..STRIP }, SPACING);
        assert_eq!(strip.width, 980.0);
        assert!(tiling.width >= 0.0, "the tiling viewport never inverts: {tiling:?}");
    }

    #[test]
    fn leaves_ordered_by_seq() {
        let tree = split(
            "root",
            Direction::Horizontal,
            0.5,
            split("l", Direction::Vertical, 0.5, leaf("a"), leaf("b")),
            leaf("c"),
        );
        let ids: Vec<String> = walk(&tree, VIEWPORT, SPACING).into_iter().map(|r| r.id).collect();
        assert_eq!(ids, ["a", "b", "c"]);
    }
}

#[cfg(test)]
mod parse_tests {
    use super::*;

    fn chunk(id: &str, body: TileBody) -> TileChunk {
        TileChunk { id: id.into(), body }
    }

    fn place(tile: &str, scope: &str, seq: i64) -> Placement {
        Placement { tile: tile.into(), scope: scope.into(), seq }
    }

    const H_SPLIT: TileBody = TileBody::Split { direction: Direction::Horizontal, ratio: 0.5 };

    #[test]
    fn single_leaf_on_tab() {
        let tree = parse("tab", &[chunk("a", TileBody::Leaf)], &[place("a", "tab", 1)]);
        assert_eq!(tree, Ok(Tile::Leaf { id: "a".into() }));
    }

    #[test]
    fn split_children_ordered_by_seq_not_input_order() {
        let tiles = [chunk("s", H_SPLIT), chunk("a", TileBody::Leaf), chunk("b", TileBody::Leaf)];
        // placements given seq-last first
        let placements = [place("s", "tab", 1), place("b", "s", 2), place("a", "s", 1)];
        let tree = parse("tab", &tiles, &placements).unwrap();
        match tree {
            Tile::Split { first, second, .. } => {
                assert_eq!(*first, Tile::Leaf { id: "a".into() });
                assert_eq!(*second, Tile::Leaf { id: "b".into() });
            }
            other => panic!("expected split, got {other:?}"),
        }
    }

    #[test]
    fn nested_split_parses() {
        let tiles = [
            chunk("root", H_SPLIT),
            chunk("a", TileBody::Leaf),
            chunk("inner", TileBody::Split { direction: Direction::Vertical, ratio: 0.3 }),
            chunk("b", TileBody::Leaf),
            chunk("c", TileBody::Leaf),
        ];
        let placements = [
            place("root", "tab", 1),
            place("a", "root", 1),
            place("inner", "root", 2),
            place("b", "inner", 1),
            place("c", "inner", 2),
        ];
        let tree = parse("tab", &tiles, &placements).unwrap();
        let expected = Tile::Split {
            id: "root".into(),
            direction: Direction::Horizontal,
            ratio: 0.5,
            first: Box::new(Tile::Leaf { id: "a".into() }),
            second: Box::new(Tile::Split {
                id: "inner".into(),
                direction: Direction::Vertical,
                ratio: 0.3,
                first: Box::new(Tile::Leaf { id: "b".into() }),
                second: Box::new(Tile::Leaf { id: "c".into() }),
            }),
        };
        assert_eq!(tree, expected);
    }

    #[test]
    fn placements_on_other_scopes_ignored() {
        let tiles = [chunk("a", TileBody::Leaf), chunk("x", TileBody::Leaf)];
        let placements = [place("a", "tab", 1), place("x", "other-tab", 1)];
        assert_eq!(parse("tab", &tiles, &placements), Ok(Tile::Leaf { id: "a".into() }));
    }

    #[test]
    fn split_must_hold_exactly_two_children() {
        let tiles = [chunk("s", H_SPLIT), chunk("a", TileBody::Leaf)];
        let one = [place("s", "tab", 1), place("a", "s", 1)];
        assert_eq!(
            parse("tab", &tiles, &one),
            Err(ParseError::SplitChildren { id: "s".into(), count: 1 })
        );

        let tiles3 = [
            chunk("s", H_SPLIT),
            chunk("a", TileBody::Leaf),
            chunk("b", TileBody::Leaf),
            chunk("c", TileBody::Leaf),
        ];
        let three = [place("s", "tab", 1), place("a", "s", 1), place("b", "s", 2), place("c", "s", 3)];
        assert_eq!(
            parse("tab", &tiles3, &three),
            Err(ParseError::SplitChildren { id: "s".into(), count: 3 })
        );
    }

    #[test]
    fn leaf_holds_no_children() {
        let tiles = [chunk("a", TileBody::Leaf), chunk("b", TileBody::Leaf)];
        let placements = [place("a", "tab", 1), place("b", "a", 1)];
        assert_eq!(parse("tab", &tiles, &placements), Err(ParseError::LeafChildren("a".into())));
    }

    #[test]
    fn placement_of_unknown_chunk_rejected() {
        let placements = [place("ghost", "tab", 1)];
        assert_eq!(parse("tab", &[], &placements), Err(ParseError::MissingChunk("ghost".into())));
    }

    #[test]
    fn tab_needs_exactly_one_root() {
        assert_eq!(parse("tab", &[], &[]), Err(ParseError::NoRoot));

        let tiles = [chunk("a", TileBody::Leaf), chunk("b", TileBody::Leaf)];
        let placements = [place("a", "tab", 1), place("b", "tab", 2)];
        assert_eq!(parse("tab", &tiles, &placements), Err(ParseError::MultipleRoots));
    }
}
