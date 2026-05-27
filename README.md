# KnowUrLLM

An interactive DSC 106 final project that asks what an LLM is "thinking" about when it reads a sentence: sparse autoencoders on public GPT-2 features (from Neuronpedia) attach an auto-generated label to every feature, but those labels can disagree with the sentence the feature actually fires on — the page builds that intuition through the cat/cataracts mismatch, walks through four scroll examples, and ties the disagreement back to LLM hallucination as the same shape one level up. To run locally: `python3 -m http.server 8000`, then open `http://localhost:8000`.
