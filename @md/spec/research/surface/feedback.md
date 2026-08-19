# Rattification

A large part of brain picked, not organised, just chronological thoughts as the proposal.md is read.

Given the nature of completion models all cant be handled simulatiously, work is best done focused but grounded in still holding all points present.

## Brain picked

I still feel thatt OS-keychain is a strange capability,

also is net, fs and exec only controllable in VM? Which we do not have yet so they are dummy?

exec is then all or nothing?

macos keychain is macos perticullar i guess and i would guess for it to work a box would have to appear "do you grant access for XXX to keychain" in macos...

---

I also find the boundary formula part a bit hard to read for my mind. As i remember parent boundaries are not inherited in {}, only if specified by the reserved caller keyword?

---

Maybe compute-verb is a complexting term, could be replaced with a real formulation as substitute?

If alreadyin use in the spec would need a note in this .md for the fold run to trickle down inteo existing spec...

---

close is layout, unmount != death, is more of a aying if surfaces are processes which they are not. However what about surfaces that need to start a daemon/service to work. Do they need to implement their own start button the first time you open the interface.

The process sidebar was more holistic when surfaces where processes, perhaps the sidebar is disolved.

Is the command pallete just for commands, narrowable by FTS and location. Seeing running processes, or all processes ordered by mutation timestamp is certainly good quick actions. Either the command pallete has that kind of support, or it is limited to the dispatch of available surfaces and when a surface is run there is the run as overlay, so i could do pallete > "reader" > "process" and i am in a task manager, but in pallete i may see a shortcut on reader, if missing probably quick add from there. So then reader is one shortcut. Is the command pallete then default to open in overlay... is the shortcut it self set to one of those modes...

If we think about the management of surfaces, when they were processes it didnt matter much that it is no longer mounted, i essentially had a history of surfaces, but now, we dont?

Also how quick could a move from overlay to content (say if i have a tiling area), good to undestand given the solid architecture.

And is it that seeing mounted surface history and recall, is a matter of looking at the full history across commits of all surfaces at a cetatin closure. Because if we think about it, in newspaper, with WYSYWIG, my own custom sidebar, or toolbar (or for that matter they are just packages to depend on and drop in, or they come with the desktop-chassis it self, or if the content mounts some default shell that is a defined surface. i would imagine that some newspaper closures are locked and some are open. I may right click a certain grid or a stack (say in the case of tabs + tiling area i press my tiling area, i ought to be able to see chronologially and then filterably all mounts made here, or i click on the closure of tabs and tiling area and do it across all. Or i do directly from command pallette, search all surfaces, perhaps lcoation wise subtracting those that are locked...

With WYSIWIG newspaper capability it is just that my sidebar is locked most of the time and my tiling area isnt, but i certainly can unlock the sidebar and manage it as i like.

So is there a diffeerence between the reader surface's definition and surfaces in their nested closure in my content...

THis needs comprehension.

---

If the desktoip chassis doesnt depend on newspaper, or solid, this becomes added as you wish to use them in your config.

Does that mean that we have the chassis-desktop, and chassic-desktop-pilot-config, is a separate module?

And regarding then consuming a renderer, that is kind of undefined isn't it? Just liek consuming a component library is, since it is now truly modular, of does the chasiss know, from the solid rendereds module toml or .ol how to load it?

Old surface processes did not have that problem...

---

Db good, engine intents possibly vague. What are intents, simply just expressions? Good that it is clear, for the engine will need udpate in spec and immpl, is the engine API already supporting the intent, then what it is...

---

On view component, contract is ambigous, its isnt a new keyword i hope.

Serves also is problematic, i think minw, minh, maxw, maxh needs to be four flat independent values. Like grades was, you dont need to contain grades, it always chooses the larger when possible.

The question is wether it is something of state, does the surface know which grade it is serving, like a prose with markdown editor and preview as separate splits (bad idea in generall i think but as an example), if it always chooses the largest, and the program actually renderes differently for the grades then i would want to be able to command menu and override.

Perhaps we start with serves, not grades, implement grade if it is neeeded. Less is more, letsnot run ahead of our selves.

We also call it intents, but that wording is a little wrong perhaps,

i gues it is up to the renderer how it maps the sdk to the component. and so in solid it ought to be values, and what, functions? can you run an intent or is there a better name for it then? More lawful and native?

---

I also find the view section a bit strange, no problem starting with component, but then we have medium, but blocks are never defined, but they are an archetype  as well are they not? I mean a surface takes a block as its root so... blocks should be presented properly and naturally before we go to medium, therefore reducing the prose for medium.

---

I think my principle for presenting and learning is kind of bottom up, it is bottom up for when a space of dependent knowledge is to be learnt, but naturally you cant start bottom up, lets say you digest this project for the first time, you cant start at the bottom, you need... Goals? is it a combonation of well defined goals, their telling values/principles as well. sub sections with their own refinements on that, this is gut presented, not ruled, but this is to be explored further. I think there is two powers working opposite direction that builds good documentation...

---

perhaps the mount is actually on, not of, because a selection is locations or augmented locations, it is not of. tohught perhaps on is wrong as well..

I see now that in view/mount in mentioning default you say both defult surface is for the parent, but you erxplicitly mention table which may no tbe the mechanic, be more precise and lawfully true, and regarding box band (one term perhaps not unified if we call it serves) i'm opting for not allowing statefulless there as metnioned.

oh see now that later came a secgion on box, vale and labels.

on vales i think there is more than one valve. one is serves is out of bounds, another is the rror boundary caught, the other is that the refernces chunked are not resolveable, possibly mor ebut those are the ones i think about.

---

Intersting i see now that you opted for ol-url for renderer and impl, and you set implementation to be for both mediums and renderers. Perhaps not the best solution... Needs reeflection,.

---

Regarding theming, i would think that different implementation may come with different configurable values, possibly shared between component and medium set...

---

Regarding the input handling, it is still a bit ambigous for an implemnteable spec, and you state input here to be per runtime, which makes sense but still abit undefined, does that mean that the runtime it self stores substrate, because if it is standardised and instead part of the sdk, then we are most likely talking about a contracted and global view archetype isntead...

Is it that a runtime implements its own integration, that projects or otherwise...

---

The use of realm happens a few time, a new word that perhaps as a more straight forward name? Oh i see realm is a honour term and explained, ok.

---

stored arrangements do not nest, what do you mean?

Or yes, two more valves, not viewable because of technology missmatch, must be open at another tech root, and not viewable because of medium limitation, newspaper nesting limit for isntance. must me viewed / mounted in a higher closure.

Block grammar is open, ok. Lets certainly spec them.

We do want horisontal and vertical list, either overflow or wrap.

Do we want grid? or is it almost alwasy solvesable with composition of lists?

Also calling it newspaper is kind of nice but that is more our implemnation style, other implemntations may use borders and boxes instead.

So perhaps it is actually a kind of flex, maybe flex is a bad word because it is a settled spec, space between is probably not wanted, but having a list beeing filled fully, with wrap or with scroll...

Sure overlay is as stated just for the position and possible background/backdrop, but, when i think about the command menu it makes me think about something. In newspaper design language space is used for rhythm, it is need for nesting especially, a vertical list in the reader naturally uses more space between the elements thatn the elements surfaces use internally. However the command menu or the command pallette both have lists of results that perhaps do not need spacing, and perhaps the rule is that the elements them selves are components not blocks. If i want multiple section of the command menu, then i wrap a list in a block and these section are split, with or without labels preceeding them. In our implemntation each block is withotu background but on hover it is highlighted, naturally the same in the list. Is highlighted background awlays edge to edge? In the case of nesting i would think that the spacing between the elements of an ellement of the readers list may have the same padding as it has gap between its children then if the elemene ts of the readers lists i edge to edge naturally they have double the spacing between them. So we are not talking about spacing in that case if things are walys edge to edge, we are only talking about padding, but that fails i think i dont think newspapers layout has everything edge to edge, also are labels outside or walys inside the highlited area... probably inside tohught it may look a bit stupid, not as stupid though if the areas is marked with chrome, such as a color from the colation or a notification, where the marker may be top right corner and the albel is top left...

Lets nail this specifically. then the command surface is made using "newspaper", and depending on what we rule here, hypothetically elements of components (perhaps though only homogenous lists and not heterogenous list though not sure abou tthat either) dont have spacing between the hihgligted areas....

---

Also a note for the futuktop chassis works for ui i imagine because everything is local, but as soon as the db or engine with latency or bandwidth applide we will probably need for the chassis to run its own engine and db, kind of like optimistic updates....

---

Regarding the reader surface,

 i think we need to get specific we are not specific.

We need to ground it a bit because it is not right so we need to think about what you do and how.

So you may click on a chunk at it becomes a selection in the collation, then another "member" ought to be able to take that as an arg (at least we though so before)

the selection of surface is also interesting. lets try some examples.

The selection is a mixed set of chunks, one chunk of a, one of b and then a set of c's that can be a list. What does that render as?

If my selection is a list of chunks, then naturally i want a list, tohugh i ought to be able to configure the block settings, the elements surface is different though and naturally configurable. so i can have a list of agent processes but i mount each el as a list of process surface and context overview...

So the reader kind of works dynamically with blocks.

And in the diff example i have to members, the follow list of the latest agent process and my added draft process, they can show together, maybe a third member is different and cant be showed together, then the members are kind of like tabs.

Or they are presented all together but then as limited overview, perhaps even foldeable...

We need to focus and work more on the reader before folding.

Also the attributes thing is lost on here,

and we need to get perfectly clear about the types of marked/chrome there is.

---

Same goes fo the table, is it just the kv, when showing a chunk we have  chunk surface with chunk info and table embedded just for the body or is the table full chunk details and table body....

---

is secrets actually and integration, does it actually project all your secrets or do you have to manually set them, then it isnt an integration...

---

A double check, you say that engine is responible for capability providing, not the chassis?

The chassis is also heavlly underspecced so we are going to need to work on that.

Of course the big blocks question but also just getting all of the chunks and mechanics specced.

Though again we might be thinking about the chassis and our shell as different modules, then the shell is project managent etc or the chassis, undefined, needs progress..
