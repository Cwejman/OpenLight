# Radia Perlman

## What they built
Invented the Spanning Tree Protocol (STP) at DEC in 1984 — the algorithm that made Ethernet bridging workable by preventing loops. Later designed TRILL (Transparent Interconnection of Lots of Links), the successor that fixes STP's inefficiencies while allowing gradual migration. Author of *Interconnections: Bridges, Routers, Switches, and Internetworking Protocols*, the standard textbook. Significant work on network security, trust models, and ephemeral key storage.

## In their own words

- "My apology to the world for introducing spanning tree." — repeated in multiple talks; she considers forwarding Ethernet packets at all to be the wrong idea
- "That particular thing was a very small piece of my career." — on STP, LACNIC interview
- "No one person invented the Internet, there are so many different pieces of it." — rejecting the "mother of" label, LACNIC
- "I did happen to be at the right place, at the right time, and at the dawn of networking." — LACNIC
- "If I had not invented what I did, somebody else would have." — LACNIC
- On conferences for women in CS: "Having conferences specifically for women in computer science makes the stereotype that women get special treatment... If you improve the environment for everybody, it will also be better for women."
- On the category confusion she still blames for bad architecture: people "thought the ethernet was the same as a network, when it was really only a link."

## Principles as they articulated them

- **Auto-configuration is non-negotiable.** Protocols must figure themselves out by "gossiping amongst themselves" — humans tuning configs is a design smell.
- **Bridging vs routing is a category error society never fixed.** Ethernet is a *link*, not a network; the industry conflated the two and she has spent decades trying to undo the consequences (TRILL being one attempt).
- **Simplicity proves itself.** Her STP anecdote: she wrote the spec, the algorithm was so simple implementers shipped it without asking her a single question, and she spent the rest of the week writing a poem about it.
- **Security should be about what you can prove, not what you hope.** Her later work on ephemeral data, assured delete, and trust models rejects hand-wavy "just encrypt it" framings.

## What surprised me in research

- She openly **regrets** spanning tree. Not as false modesty — she thinks the entire premise (layer-2 forwarding of Ethernet across large networks) was a mistake, and STP just made a bad idea usable. The most famous thing she's known for is, to her, a small apology.
- The "Algorhyme" poem ("I think that I shall never see / a graph more lovely than a tree…") was literally written into the patent. She says she spent more time on the poem than the algorithm.
- She **refuses the "Mother of the Internet" framing in every interview** and the interviewers keep using it anyway. The label is journalistic inertia, not self-description.
- She is skeptical of women-in-tech conferences on anti-stereotype grounds — a position most profiles omit because it complicates the hero narrative.
- Her textbook *Interconnections* is the quiet anchor of her reputation in the field; practitioners know it the way physicists know Jackson.

## Recent or later work

- Fellow at Dell EMC / Dell Technologies through the 2010s, then moved on; her more recent work has focused on network security, trust anchors, and data ephemerality (assured delete).
- Holds over 100 patents. Inducted into the Internet Hall of Fame (2014) and National Inventors Hall of Fame (2016).
- Continues to give distinguished lectures (e.g., Northeastern Khoury, 2016, titled "Network protocols: myths, missteps, and mysteries" — the title itself summarizes her revisionist posture). Appearances through at least the early 2020s.
- TRILL (RFC 6325, 2011) remains her structural rebuttal to STP: same migration-friendly spirit, actually-optimal paths.

## Sources

- https://en.wikipedia.org/wiki/Radia_Perlman — Radia Perlman — wikipedia.org
- https://blog.lacnic.net/en/an-interview-with-internet-pioneer-radia-perlman/ — An Interview with Internet Pioneer Radia Perlman — blog.lacnic.net
- https://www.siliconvalleywatcher.com/intels-radia-perlman-dont-call-her-mother-of-the-internet/ — Don't Call Her "Mother Of The Internet" — siliconvalleywatcher.com
- https://www.khoury.northeastern.edu/network-protocols-myths-missteps-and-mysteries/ — Network protocols: myths, missteps, and mysteries (distinguished lecture) — khoury.northeastern.edu
- https://hackaday.com/2018/05/29/spanning-the-tree-dr-radia-perlman-untangling-networks/ — Spanning The Tree — hackaday.com
- https://cs.wmich.edu/gupta/teaching/cs4310/lectureNotes_cs4310/spanning%20tree%20poem%20by%20Radia%20Perlman.pdf — Algorhyme poem — cs.wmich.edu
