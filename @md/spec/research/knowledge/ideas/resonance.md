---
under: the code
kind: brief
---

# How two holons drive each other

## 1. Direct coupling is forbidden, and for a reason

Classic frequency-modulation synthesis lays its operators in a graph with no cycles *[Chowning 1973]*, and the one loop it allows is an operator feeding itself, reading not the present sample but the last two averaged, as the Yamaha DX7 does. Two operators modulating each other is refused.

The refusal is not timidity: computing the first now needs the second now, which needs the first now, and nothing resolves it. A loop with no delay in it has no solution to compute.

![A chart of eight numbered panels, each wiring four boxes numbered 1 to 4 with lines running down to an arrow; in every panel operator 4 has a line looping back into itself, and no other line returns upward](https://upload.wikimedia.org/wikipedia/commons/a/ae/FM_4-Op_Algorithm.png)\
The eight algorithms of the DX7's smaller four-operator siblings, in [TYalaA's chart](https://commons.wikimedia.org/wiki/File:FM_4-Op_Algorithm.png) under CC BY-SA 4.0: every wiring flows down to the output, and the only loop is an operator's own.

So the first finding is a negative one, and it is the useful half of the answer. Two wholes cannot drive each other through each other's present state. Whatever passes between them must have left one before it arrives at the other.

*Reasoned, from sources named from memory; the DX7's feedback is not checked here.*

## 2. The violin says the same thing, physically

A bow does not read a string. The hairs and the string meet at a contact that sticks and slips, and the string's own disturbance travels its length and returns, which is the delay made of distance *[Helmholtz 1863]*.

Each keeps its own space of resonance, the string's modes and the bow's tension and the stick's own ringing, and what crosses between them is force and motion at one point.

That is why the bowed string is the right picture for the code. Two wholes, mutually driving, neither containing the other, joined at a boundary and separated by the time it takes to cross.

*Reasoned, the author's picture; the source named from memory.*

## 3. What is actually computed is a meeting, not a read

A string in a digital waveguide is two delay lines carrying travelling waves in opposite directions, and the bow is a junction placed on them *[Smith 1992]*.

At each sample the string offers what its incoming waves imply, a straight relation between force and motion set by its impedance; the bow offers its friction curve, which is not straight; and the answer is where the two curves cross *[McIntyre, Schumacher and Woodhouse 1983]*.

The generalisation is older and stricter. In wave digital filters every element exposes a port, an arriving wave and a departing one, and the ports are given resistances chosen so that no loop without delay can form anywhere *[Fettweis 1986]*.

The discipline is exactly the code's: nothing reaches into anything, each declares what leaves it and accepts what arrives.

*Reasoned, from sources named from memory and not checked.*

## 4. What this gives the code

Mutual driving is a third relation beside [nesting](../code.md#321-the-holarchy) and [the link](../code.md#322-the-link), and it costs two things. A port, where each holon says what leaves it and takes what arrives, and never the other's inside. And a delay, which is what keeps each one whole; remove it and the two collapse into one thing that cannot be solved.

The meeting itself is a holon of its own. The friction of the bow belongs neither to the bow nor to the string; it is where their two characteristics cross, and it has to be somewhere. So a substrate that lets parts drive each other needs a place for junctions, and they are parts like any other.

A junction can itself be amplified. Where the meeting between two holons needs judgment rather than a fixed curve, the junction is a program with a model in it, holding the cognition the two have in common while each keeps its own focus; the author believes a shipped system already works this way, and it is not checked here.

That is coordination as a unit of its own, and it is the same position the friction of the bow holds, one step up in kind.

Whether the code should carry this, or whether it belongs only where signals flow, is open. It is stated here and not lifted.

*Reasoned, and grounded in methods that work in shipped instruments; the sources are named from the writer's memory, a model's, and none was checked in this session. [Their verification is owed to the grounds](../study/grounds.md).*
