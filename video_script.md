# Demo Video Script

Target length: 1:45-2:00.

## 0:00-0:15 Hook

"Can you search a language model's hidden vocabulary? We usually see only a
prompt and an answer, but sparse autoencoders expose internal features that look
like URLs, Python prompts, city names, money, political titles, or pop-culture
phrases."

## 0:15-0:35 Motivation

"Neuronpedia is excellent for inspecting one feature at a time. Our project asks
a different question: what happens when students can map thousands of features
together, search them, and compare where they appear across GPT-2 layers?"

## 0:35-1:20 Visualization Walkthrough

Show the atlas. Search for `python`, click the Python result, and point out:

- each dot is one SAE feature
- position comes from explanation embeddings
- color shows concept group, layer, or legibility
- the detail panel compares the label, density, predicted tokens, and activation windows

Then search for `star wars` and `cat`. For `cat`, mention that a label can be
messier than it looks because token fragments can light up in words like
"cataracts."

## 1:20-1:45 Aggregate Patterns

Scroll to the heatmap and histogram. Say:

"The heatmap shows that syntax-like features dominate this sample, while social
media and animal features are rare. The histogram shows that most features are
very sparse, which is why search and filtering matter."

## 1:45-2:00 Takeaway

"The takeaway is that interpretability gives handles, not final answers. The
atlas makes internal features searchable and inspectable, but the strongest
design choice is that it also shows uncertainty: labels, logits, and activating
tokens do not always tell the same story."
