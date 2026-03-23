#!/usr/bin/env node
// OpenLight TUI mockup — split view, independent columns
// Run: node tui-mockup.js

const R = '\x1b[0m'
const B = '\x1b[1m'
const D = '\x1b[2m'
const green = '\x1b[32m'
const blue = '\x1b[34m'
const yellow = '\x1b[33m'
const magenta = '\x1b[35m'
const G = '\x1b[90m'
const L = '\x1b[37m'
const Bc = '\x1b[1;36m'
const Bg = '\x1b[1;32m'
const Bb = '\x1b[1;34m'
const By = '\x1b[1;33m'
const Bw = '\x1b[1;37m'

const LEFT_WIDTH = 48
const GAP = 5

function visLen(s) {
  return s.replace(/\x1b\[[0-9;]*m/g, '').length
}

function pad(s, width) {
  const diff = width - visLen(s)
  return diff > 0 ? s + ' '.repeat(diff) : s
}

function merge(left, right) {
  const max = Math.max(left.length, right.length)
  const lines = []
  for (let i = 0; i < max; i++) {
    const l = i < left.length ? left[i] : ''
    const r = i < right.length ? right[i] : ''
    lines.push(pad(l, LEFT_WIDTH) + ' '.repeat(GAP) + r)
  }
  return lines
}

// --- Left column ---

const left = []

// Top bar
left.push(` ${Bc}culture${R}`)
left.push(``)
left.push(``)

// Scope summary — wrap near LEFT_WIDTH (indent 1, so ~47 usable chars)
left.push(` ${L}Organizational values shaping projects, people,${R}`)
left.push(` ${L}and learning pathways. Five core members, two${R}`)
left.push(` ${L}relating perspectives.${R}`)
left.push(``)
left.push(``)

// projects (not selected) — summaries wrap near LEFT_WIDTH (indent 5, so ~43 usable)
left.push(`   ${Bg}projects${R}  ${L}5${R}`)
left.push(``)
left.push(`     ${L}Programs shaped by organizational values —${R}`)
left.push(`     ${L}30-day change requirement and community${R}`)
left.push(`     ${L}governance across all initiatives${R}`)
left.push(``)
left.push(`     ${blue}people${R} ${G}4${R}  ${D}·${R}  ${yellow}education${R} ${G}1${R}`)
left.push(``)
left.push(``)

// people (selected, inside — instance selected)
left.push(` ${B}▸ ${Bb}people${R}  ${L}5${R}`)
left.push(`     ${Bw}instance ${L}3${R}  ${G}relates ${R}${G}2${R}`)
left.push(``)
left.push(`     ${L}Team members who embody cultural values —${R}`)
left.push(`     ${L}founders, staff promoted from within, and${R}`)
left.push(`     ${L}volunteers shaping the mission day to day${R}`)
left.push(``)
left.push(`     ${green}projects${R} ${G}4${R}  ${D}·${R}  ${yellow}education${R} ${G}2${R}`)
left.push(``)
left.push(``)

// education (not selected)
left.push(`   ${By}education${R}  ${L}2${R}`)
left.push(``)
left.push(`     ${L}Learning pathways grounded in community${R}`)
left.push(`     ${L}values and practical development goals${R}`)
left.push(``)
left.push(`     ${blue}people${R} ${G}2${R}  ${D}·${R}  ${green}projects${R} ${G}1${R}`)
left.push(``)
left.push(``)

// partnerships (outlier)
left.push(`   ${D}${magenta}partnerships${R}  ${D}1${R}`)
left.push(``)
left.push(`     ${D}${L}External collaborations aligned with${R}`)
left.push(`     ${D}${L}cultural principles and shared goals${R}`)


// --- Right column: chunks for focused dim (people) ---
// Text wraps to fill available space to terminal edge

const right = []

// Header — right-aligned count with i/r
right.push(`                        ${L}7 ${G}(instance ${L}5${G}  relates ${L}2${G})${R}`)
right.push(``)
right.push(``)

// Chunk 1
right.push(`${L}Alice joined the founding team in March 2024 and${R}`)
right.push(`${L}built the community outreach program.${R}`)
right.push(``)
right.push(`${G}name   ${R}${L}Alice Chen${R}`)
right.push(`${G}role   ${R}${L}Community Lead${R}`)
right.push(``)
right.push(`${G}instance${R} ${Bc}culture${R} ${Bg}projects${R} ${Bb}people${R}`)
right.push(`${G}relates${R}  ${By}education${R}`)
right.push(``)
right.push(``)

// Chunk 2
right.push(`${L}The summer youth program runs on a 30-day change${R}`)
right.push(`${L}cycle with alumni pipeline.${R}`)
right.push(``)
right.push(`${G}status ${R}${L}active${R}`)
right.push(``)
right.push(`${G}instance${R} ${Bc}culture${R} ${Bg}projects${R}`)
right.push(`${G}relates${R}  ${Bb}people${R} ${By}education${R}`)
right.push(``)
right.push(``)

// Chunk 3
right.push(`${L}Bob transitioned from volunteer to staff, promoted${R}`)
right.push(`${L}from within.${R}`)
right.push(``)
right.push(`${G}name   ${R}${L}Bob Rivera${R}`)
right.push(`${G}role   ${R}${L}Program Director${R}`)
right.push(``)
right.push(`${G}instance${R} ${Bc}culture${R} ${Bb}people${R}`)
right.push(`${G}relates${R}  ${Bg}projects${R}`)


// --- Merge and render ---

const output = merge(left, right)

// Footer — 2 blank lines before
output.push(``)
output.push(``)
output.push(` ${Bw}hjkl${R}${G}/${Bw}tab${R}${G} navigate  ${Bw}t${R}${G}oggle  ${Bw}a${R}${G}dd  ${Bw}d${R}${G}rop  ${Bw}p${R}${G}ull  ${Bw}u${R}${G}ndo  ${Bw}r${R}${G}edo  ${Bw}?${R}${G}help  ${Bw}q${R}${G}uit${R}`)
output.push(``)

process.stdout.write('\x1b[H\x1b[J')
console.log(output.join('\n'))
