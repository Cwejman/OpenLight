# Linus Torvalds

## What they built
Created the Linux kernel in 1991 as a university student in Helsinki, and has been its lead maintainer ever since. Also created Git in 2005 after the BitKeeper fallout — built the initial working version in about ten days. In 2012 created Subsurface, a dive-log application, which is his other long-running project.

## In their own words

- "I am not an emotionally empathetic kind of person and that probably doesn't come as a big surprise to anybody." — LKML, 2018-09-16, the "4.19-rc4 released, an apology, and a maintainership note" message.
- "My flippant attacks in emails have been both unprofessional and uncalled for. Especially at times when I made it personal." — same LKML message.
- "I need to change some of my behavior, and I want to apologize to the people that my personal behavior hurt and possibly drove away from kernel development entirely." — same LKML message. He explicitly framed the break as not burnout but as going to "get some assistance on how to understand people's emotions and respond appropriately."
- On AI-assisted coding (Open Source Summit Korea 2025, keynote with Dirk Hohndel): he called himself "fairly positive" about it as a way to get computers to do things people otherwise couldn't — but added that "vibe coding" is "a horrible, horrible idea from a maintenance standpoint." (The Register, 2025-11-18.)
- On his own role: he said that "for the last almost 20 years" he has not been a programmer but a technical lead and maintainer, with the real work done by other people. (Open Source Summit Korea 2025, via Practical-Tech and Computer Weekly.)
- On Rust in the kernel: slow adoption is due to long-time C kernel developers' resistance and to Rust's infrastructure instability, but Rust is now "becoming a real part of the kernel instead of being an experimental thing." (KubeCon 2024, via Practical-Tech.)

## Principles as they articulated them
- Taste and maintainability over cleverness: "vibe coded" code may work but is a long-term maintenance hazard.
- The kernel is "the only thing that matters" — userspace comes and goes, the kernel endures. (Stated in the 2024 KubeCon keynote.)
- Pragmatism over visionary design — he frames himself as a janitor/merger, not a visionary.
- Public, in-the-open disagreement is part of the work; after 2018 he tried to decouple bluntness from personal attack.

## What surprised me in research
- The 2018 apology was explicitly not framed as burnout. He compared it to the break he took to build Git — a deliberate pause with a specific goal, this time behavioral.
- He now openly says he has not been a "programmer" for nearly 20 years. That contradicts the popular image of Linus still hacking kernel internals.
- He is publicly positive on AI as a programming aid — qualified but not dismissive — which is sharply different from many of his peers.

## Recent or later work
Still BDFL of the Linux kernel, now rolling Rust in cautiously. He also maintains Subsurface. After the 2018 break he instituted a Contributor Covenant code of conduct. In 2024 he publicly flamed a Google kernel contributor, showing the bluntness remains — but the explicitly personal attacks have receded.

## Sources
- https://lkml.org/lkml/2018/9/16/167 — "Linux 4.19-rc4 released, an apology, and a maintainership note" — lkml.org
- https://www.theregister.com/2018/09/17/linus_torvalds_linux_apology_break/ — "Linux kernel's Torvalds: 'I am truly sorry'" — theregister.com
- https://www.theregister.com/2025/11/18/linus_torvalds_vibe_coding/ — "Linus Torvalds: Vibe coding is fine, but not for production" — theregister.com
- https://practical-tech.com/2024/08/23/linus-torvalds-talks-ai-rust-adoption-and-why-the-linux-kernel-is-the-only-thing-that-matters/ — "Linus Torvalds talks AI, Rust adoption..." — practical-tech.com
- https://www.computerweekly.com/news/366608487/Linus-Torvalds-discusses-Linux-development-security-and-AI-at-KubeCon — "Torvalds discusses Linux development, security and AI at KubeCon" — computerweekly.com
- https://www.theregister.com/2024/01/29/linux_6_8_rc2/ — "Linus Torvalds flames Google kernel contributor" — theregister.com
