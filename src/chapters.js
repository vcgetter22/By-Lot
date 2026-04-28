// Verbatim chapter content. Roman numerals + slug + preamble lines + prompt + post type/payload.
// Source: design handoff bundle. Do not edit without project owner's approval.
export const CHAPTERS = [
  {
    n: "I", slug: "believe", title: "Believe",
    preamble: [
      "Do you like Democracy?",
      "Ninety-one point six percent of the world says yes.",
      "So you probably will too.",
      "Before you do, write down what you are actually agreeing to."
    ],
    prompt: "Write what democracy means to you, in one paragraph. Try to be specific. It can be a statement, a question, or both at once.",
    post: { kind: "echoes" }
  },
  {
    n: "II", slug: "govern", title: "Govern",
    preamble: [
      "Demos. Kratia. Rule of the people.",
      "Why never by the people?",
      "We. You. Ruling.",
      "Not “the politicians.” Not your representative. Not your vote.",
      "You — making a decision that binds others to its outcome."
    ],
    prompt: "Describe the most recent decision you made that felt like governing. Apartment block. Workplace. Family. Small ones count. Tell us what it was, who was bound by it, what you watched out for as you decided — what you were afraid would break, who you didn’t want to hurt, what shape the responsibility took in your body. And what it cost you to make it.",
    post: {
      kind: "quote",
      text: "The English people thinks itself free; it is greatly mistaken: it is free only during the election of members of parliament; once they are elected, it is enslaved, it is nothing.",
      attr: "— Jean-Jacques Rousseau, The Social Contract, 1762."
    }
  },
  {
    n: "III", slug: "silence", title: "Silence",
    preamble: [
      "Most of your political beliefs are negotiated in silence.",
      "Between you and the people you are quietly afraid will judge you.",
      "No one you know will read this."
    ],
    prompt: "Write something politically true for you that you have never said out loud. Anywhere. Not online, not at dinner, not to your closest person.",
    post: { kind: "silence" }
  },
  {
    n: "IV", slug: "lesser", title: "Lesser",
    preamble: [
      "You have probably voted for someone you did not fully believe in.",
      "Or chosen not to vote because no one was worth it.",
      "Either way, the moment had a weight."
    ],
    prompt: "Describe the most recent time you stood at the threshold of an electoral choice — the booth, the form, the kitchen-table argument, the news on the morning of. Tell us what the weight was made of.",
    post: {
      kind: "quote",
      text: "We have all become election fundamentalists. We despise those who are elected, but venerate elections themselves.",
      attr: "— David Van Reybrouck, Against Elections, 2016."
    }
  },
  {
    n: "V", slug: "drawn", title: "Drawn",
    preamble: [
      "A small ceremony, somewhere in the Bundestag basement.",
      "A clerk pulls a name. It is yours.",
      "Beginning Monday: parliament. Four years. Salary, briefing materials, a research staff, a desk.",
      "No campaign. No party. No promise made."
    ],
    prompt: "Describe the first day. What you wear. Who you call before you leave. What you walk into the chamber and say. Be specific.",
    post: {
      kind: "quote",
      text: "It is considered democratic for offices to be filled by lot, and oligarchic for them to be filled by election.",
      attr: "— Aristotle, Politics IV.9, fourth century BCE."
    }
  },
  {
    n: "VI", slug: "imagine", title: "Imagine",
    preamble: [
      "It is five years from now.",
      "The Bundestag, the Senate, the parliament you grew up with — half of its seats are filled by lot.",
      "Ordinary citizens. Four-year terms. No campaigns. Strangers selected, every January, from a list that includes everyone."
    ],
    prompt: "Describe a Tuesday morning in this country. The headlines. The breakfast table. What people argue about now that they could not argue about before. What they no longer argue about. Or — tell us a sentence you overhear at the bus stop that you have never overheard before. Or both. Be small. Be specific. The bigger the dream, the smaller the texture should be.",
    post: { kind: "line", text: "Two hundred years ago, the universal vote was equally unimaginable." }
  },
  {
    n: "VII", slug: "objection", title: "Objection",
    preamble: [
      "Now imagine you were not drawn.",
      "Your neighbour was. The barista. The man you walk past at the train station each morning.",
      "Your country is governed, in part, by people exactly as ordinary as the ones you see every day."
    ],
    prompt: "What is your strongest objection to a parliament chosen by lot?",
    post: {
      kind: "objections",
      lead: "Your objection is almost certainly already in Bernard Manin’s 1995 catalogue of ten standard objections. David Van Reybrouck answers each one.",
      list: [
        ["Citizens are not competent.", "Neither, by default, are elected representatives. Both are supported by staff, briefings, and time. Juries decide capital cases on this same logic."],
        ["A random sample is not statistically representative.", "Stratified sortition is demographically closer to the population than any elected parliament has ever been."],
        ["Drawn citizens have no electoral mandate.", "Mandate-by-election is the aristocratic logic this argument was written against."],
        ["Drawn citizens cannot be voted out.", "That is the point: freedom from re-election fever, which currently shortens every horizon."],
        ["The tyranny of the majority will return.", "A bicameral system retains constitutional courts and a smaller elected chamber as checks."],
        ["Athens excluded women, foreigners, and slaves.", "So did the 1789 vote. The procedure was democratic; the inclusion was not. We are arguing about procedure."],
        ["The proposal is utopian.", "It has been run, on a national scale, in Canada, the Netherlands, Iceland, and Ireland — the latter producing a binding 2015 constitutional referendum."],
        ["Deliberation produces consensus and erases real political conflict.", "Bouricius’s design uses secret final ballots: the deliberation is structured, the conflict is not erased."],
        ["It does not scale.", "That was the argument against the universal vote. Stratified sampling, paid service, multiple bodies — these are technical, not principled, problems."],
        ["Democracy without elections is a contradiction in terms.", "Two thousand five hundred years of democratic theory disagrees. The argument that elections = democracy is younger than the United States."]
      ]
    }
  },
  {
    n: "VIII", slug: "future", title: "Future",
    preamble: [
      "Reform proposals are easy.",
      "Imagining a future that actually arrives, and that you would still want once it did, is harder."
    ],
    prompt: "If you knew your idea would never become law — but you would have to live, until the end of your life, with the system we have now — what would you propose anyway? Tell us what to do, not what is wrong.",
    post: { kind: "none" }
  },
  {
    n: "IX", slug: "speech", title: "Speech",
    preamble: [
      "Athens, 4th century BCE. A slab of stone with slots for names — the kleroterion — randomly assigning citizens to the assembly. Government by lot, for two hundred years.",
      "1848. The demand: the right to vote.",
      "2026. The demand, perhaps: the right to be heard. Not agreed with. Heard."
    ],
    prompt: "The next person who arrives at this site is anonymous, like you. Same questions, same silence. They will read what you write here. Tell them what you want them to know — about democracy, about us, about what they are about to do. If you could leave only one sentence on this wall, leave that one.",
    post: { kind: "closing" }
  }
];

export const VALID_SLUGS = CHAPTERS.map(c => c.slug);

export function placeholderFor(slug) {
  const map = {
    believe: "What you actually mean by it…",
    govern: "The decision, the people bound, the cost…",
    silence: "The thing you have not said…",
    lesser: "The weight, what it was made of…",
    drawn: "What you wear. Who you call. What you say.",
    imagine: "A Tuesday morning. A sentence at the bus stop.",
    objection: "Your strongest objection.",
    future: "What you would propose anyway.",
    speech: "What you want the next person to know."
  };
  return map[slug] || "Write here.";
}

export function sendLabelFor(slug) {
  if (slug === 'silence') return 'Leave it here →';
  return 'Send →';
}
