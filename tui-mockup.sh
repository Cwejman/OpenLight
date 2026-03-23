#!/bin/bash
# OpenLight TUI mockup — split view
# Each line: left content, cursor to col 53, right content
# Run: bash tui-mockup.sh

R='\033[0m'     # reset
B='\033[1m'     # bold
D='\033[2m'     # dim
g='\033[32m'    # green
b='\033[34m'    # blue
y='\033[33m'    # yellow
m='\033[35m'    # magenta
G='\033[90m'    # gray
L='\033[37m'    # light gray
Bc='\033[1;36m' # bold cyan
Bg='\033[1;32m' # bold green
Bb='\033[1;34m' # bold blue
By='\033[1;33m' # bold yellow
Bw='\033[1;37m' # bold white

C='\033[53G'    # cursor to column 53

# Each printf is one screen line. Left side printed first, $C jumps to col 53, right side follows.
# Lines with only left content: no $C. Lines with only right content: start with $C.

clear
echo ""
#                LEFT                                          RIGHT
printf " ${Bc}culture${R}                                    ${C}${L}7${R}\n"
printf "\n"
printf " ${L}Organizational values shaping${R}               ${C}${L}Alice joined the founding team in${R}\n"
printf " ${L}projects, people, and learning${R}              ${C}${L}March 2024 and built the community${R}\n"
printf " ${L}pathways. Five core members,${R}                ${C}${L}outreach program.${R}\n"
printf " ${L}two relating perspectives.${R}\n"
printf "                                                ${C}${G}name   ${R}${L}Alice Chen${R}\n"
printf "                                                ${C}${G}role   ${R}${L}Community Lead${R}\n"
printf "\n"
printf "                                                ${C}${G}instance${R} ${Bc}culture${R} ${Bg}projects${R} ${Bb}people${R}\n"
printf "   ${Bg}projects${R}  ${L}5${R}                                ${C}${G}relates${R}  ${By}education${R}\n"
printf "\n"
printf "     ${L}Programs shaped by organizational${R}\n"
printf "     ${L}values — 30-day change requirement${R}\n"
printf "     ${L}and community governance${R}\n"
printf "\n"
printf "     ${b}people${R} ${G}4${R}  ${D}·${R}  ${y}education${R} ${G}1${R}\n"
printf "\n"
printf "                                                ${C}${L}The summer youth program runs on${R}\n"
printf " ${B}▸ ${Bb}people${R}  ${L}5${R}                                  ${C}${L}a 30-day change cycle with alumni${R}\n"
printf "     ${L}instance ${G}3${R}  ${L}relates ${G}2${R}                  ${C}${L}pipeline.${R}\n"
printf "\n"
printf "     ${L}Team members who embody cultural${R}         ${C}${G}status ${R}${L}active${R}\n"
printf "     ${L}values — founders, staff promoted${R}\n"
printf "     ${L}from within, volunteers${R}                  ${C}${G}instance${R} ${Bc}culture${R} ${Bg}projects${R}\n"
printf "                                                ${C}${G}relates${R}  ${Bb}people${R} ${By}education${R}\n"
printf "\n"
printf "     ${g}projects${R} ${G}4${R}  ${D}·${R}  ${y}education${R} ${G}2${R}\n"
printf "\n"
printf "                                                ${C}${L}Bob transitioned from volunteer${R}\n"
printf "   ${By}education${R}  ${L}2${R}                               ${C}${L}to staff, promoted from within.${R}\n"
printf "\n"
printf "     ${L}Learning pathways grounded in${R}            ${C}${G}name   ${R}${L}Bob Rivera${R}\n"
printf "     ${L}community values and practical${R}           ${C}${G}role   ${R}${L}Program Director${R}\n"
printf "     ${L}development goals${R}\n"
printf "                                                ${C}${G}instance${R} ${Bc}culture${R} ${Bb}people${R}\n"
printf "\n"
printf "     ${b}people${R} ${G}2${R}  ${D}·${R}  ${g}projects${R} ${G}1${R}              ${C}${G}relates${R}  ${Bg}projects${R}\n"
printf "\n"
printf "   ${D}${m}partnerships${R}  ${D}1${R}\n"
printf "\n"
printf "     ${D}${L}External collaborations aligned${R}\n"
printf "     ${D}${L}with cultural principles${R}\n"
printf "\n\n"
printf " ${Bw}hjkl${R}${G} navigate  ${Bw}a${R}${G}dd  ${Bw}d${R}${G}rop  ${Bw}p${R}${G}ull  ${Bw}u${R}${G}ndo  ${Bw}r${R}${G}edo  ${Bw}s${R}${G}how  ${Bw}?${R}${G}help  ${Bw}q${R}${G}uit${R}\n"
echo ""
