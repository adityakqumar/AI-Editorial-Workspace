# Sample editorial (final)

*Produced in Copydesk from three primary sources, then edited in the writing desk. ~430 words.*

## The useful model got cheap. The dangerous one got gated.

In three weeks this October, OpenAI, Anthropic, and Google each shipped a model. That is not the story. The story is that they are no longer selling the same thing.

[OpenAI’s GPT-6.1 Terra](https://openai.com/index/introducing-gpt-6-1-terra) (October 26) is a computer-use model priced at $1 per million input tokens and $5 per million output — half the list price of GPT-5.6 Terra and GPT-6.1 Sol. OpenAI says it is more than three times faster than GPT-6 Astra on computer-use tasks, and that at maximum reasoning effort it solves 50.3% of Terminal-Bench 4.0, up from 21.5% on GPT-5.6 Terra. The pitch is not “smarter than the frontier.” It is “cheap enough to fill in invoices all day.”

[Anthropic’s Claude Haiku 5.5](https://www.anthropic.com/claude-haiku-5-5) (October 7) is even more explicit about volume. For prompts under 100k tokens it costs $0.10 / $0.50 per million input/output — versus $1 / $5 for Haiku 4.5. Anthropic says that is about 75% cheaper to run on typical traffic, and it cut Sonnet 5.5 cache reads in half, which it estimates as ~20% cheaper on most agentic work. The customer quotes they chose are not about replacing Opus. Asana talks about latency. HubSpot talks about CRM audits. AlphaSense talks about 8 million document questions a week. Box and Cognition talk about subagents that pull one line from a 10-K while a larger model builds the deck.

Then [Google’s Gemini 4 Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) (October 28) goes the other way. Carbon is framed as a frontier model for cybersecurity and long-horizon engineering: 88.2% on SEC-bench Pro, 54.8% on ExploitGym, 71.0% on CWE-bench, all reported without guardrails. Introductory price matches Argon ($2 / $10 per million tokens) before rising to $4 / $20. Access does not match the leaderboard. Google is putting Carbon in front of a subset of cyber defenders via the Fairwind Program, citing U.S. pre-release testing, and saying general availability comes “as soon as possible.”

Vendors wrote every number in this piece. Do not build a cross-lab scoreboard from them. Do notice the product split. For most teams, the question this week is not whether a model can complete a workflow. It is whether you can afford to run that workflow a few thousand times a day — and whether the one model that is unusually good at finding and patching vulnerabilities is even allowed to sit in your stack.

If your product still sends every click to a frontier model, you are probably overpaying. Route the chores to something like Haiku or Terra. Keep judgment, novel code, and anything you could not explain to a customer on a larger model. And treat Carbon’s delay as information: capability and permission are now separate product axes.

**Sources:** [GPT-6.1 Terra](https://openai.com/index/introducing-gpt-6-1-terra) · [Claude Haiku 5.5](https://www.anthropic.com/claude-haiku-5-5) · [Gemini 4 Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)
