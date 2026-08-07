# Vint Cerf & Bob Kahn

## What they built
Co-designed TCP/IP (1973–1978), the protocol suite that turned the ARPANET into the Internet — a packet-switched, host-to-host architecture that any network could join. Kahn founded CNRI (1986) and built the Handle System / Digital Object Architecture. Cerf became Google's Chief Internet Evangelist (2005) and co-founded IPNSIG (1998) to extend the Internet into deep space.

## In their own words

**Cerf:**
- "As the Internet evolved, it didn't occur to us that somebody might want to interfere with it or to spread bad information." — NIH AI talk, April 2024
- "TCP/IP doesn't work at interplanetary distances. So we designed a set of protocols that do." — on Bundle Protocol / DTN, Quanta Magazine, 2020
- "As individuals, we must use critical thinking to try to resist the misinformation that shows up in the system." — on why algorithmic fixes alone fail
- "The reason that algorithms don't necessarily solve the problem is bots. Bots are those which amplify the population of apparent users who are expressing a particular opinion." — on misinformation
- On 32-bit IPv4 addressing: has repeatedly called it his biggest mistake — in a 2011 interview he said the team had "no idea" it would escape the lab, let alone become the world's network.

**Kahn:**
- "Redefining the internet as a way of managing digital objects instead of a system of moving bits" is, he says, "a very powerful" idea. — CNRI interview, 2009 (GCN/Route Fifty)
- The DOA grew out of work with Cerf in the mid-1980s on "Knowbot programs" — mobile programs in the Internet — which became the lineage for the Handle System and persistent digital-object identity.

## Principles as they articulated them

- **Cerf:** End-to-end, dumb-network design; the intelligence goes at the edges. Standards must be royalty-free and open. Interoperability beats perfection.
- **Cerf:** Extend the model, don't replace it — DTN/Bundle Protocol keeps store-and-forward semantics for links with minutes of latency.
- **Kahn:** Objects should be first-class on the network. Content, not location, should be identified. A Handle is a durable identifier that outlives any server.
- **Both:** The two diverge quietly. Cerf's instinct is to keep the bit-moving layer minimal and let applications build meaning above it. Kahn's instinct is that "just moving bits" was an incomplete architecture and the Internet should have had object management baked in.

## What surprised me in research

- Kahn's Digital Object Architecture is not an abandoned side-project: **the Handle System quietly underlies DOIs** and is used by nearly every electronic journal for identifier resolution. A parallel naming system to DNS exists and you've been using it.
- Cerf and Kahn have had a low-grade architectural disagreement for ~40 years. The standard story treats them as a unit ("the fathers"); in practice Kahn's DOA is a structural critique of what the Internet became.
- Cerf's interplanetary work is not a hobby. The **Bundle Protocol** (DTN) is an IETF standard (RFC 9171) and has flown on the ISS and on several NASA missions. IPNSIG ran a Space Summit keynote in July 2025.
- Cerf has been unusually blunt that he did not anticipate adversarial use: the 2024 NIH quote frames his own architecture as naive about malice. This is rarer than the canonical "fathers of the Internet" narrative suggests.

## Recent or later work

- **Cerf (2015–present):** still Chief Internet Evangelist at Google; active on AI policy, accessibility (he is hard of hearing and campaigns on it), and IPNSIG. Inducted into the California Hall of Fame, 2024.
- **Kahn (2015–present):** still Chairman/CEO of CNRI. The DOA, Handle System, and Digital Object Interface Protocol (DOIP) continue under CNRI and the DONA Foundation (Geneva). ITU has pushed DOA as a basis for IoT identity, which sparked controversy at ICANN.
- Both continue to publish and keynote but their public frequency differs: Cerf is prolific and public-facing; Kahn is low-profile and institutional.

## Sources

- https://nihrecord.nih.gov/2024/04/26/chief-internet-evangelist-cerf-discusses-ai-nih — Chief Internet Evangelist Cerf Discusses AI at NIH — nih.gov
- https://www.quantamagazine.org/vint-cerfs-plan-for-building-an-internet-in-space-20201021/ — To Boldly Go Where No Internet Protocol Has Gone Before — quantamagazine.org
- https://www.ipnsig.org/ — IPNSIG — ipnsig.org
- https://www.cnri.reston.va.us/tmp_hp/doa.html — Digital Object Architecture Project — cnri.reston.va.us
- https://www.icann.org/en/system/files/files/octo-002-14oct19-en.pdf — Digital Object Architecture and the Handle System (ICANN OCTO-002) — icann.org
- https://www.route-fifty.com/digital-government/2009/05/robert-kahn-a-different-kind-of-internet/288143/ — Robert Kahn: A different kind of Internet — route-fifty.com
- https://www.fastcompany.com/90663621/vint-cerf-google-misinformation — How Vint Cerf illuminated Google's misinformation mess — fastcompany.com
