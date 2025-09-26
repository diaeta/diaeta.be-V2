

# **Report on Optimizing LLM Token Economics in AI Developer Tooling**

Report for Pierre, Senior Researcher & Cost-Optimization Engineer  
Current as of: September 24, 2025

---

## **Part A: Executive Summary**

### **1\. Overview of Primary Token Sinks**

This report analyzes the mechanics of Large Language Model (LLM) token consumption within two critical developer ecosystems: the Cursor AI code editor and the suite of modern tools colloquially known as "Codex." The central finding is that token expenditure is overwhelmingly dominated not by the developer's typed prompts, but by the volume of automated and manually-added **context**. This includes persistent instructions (.cursor/rules), conversation history, file attachments (@file), and, most significantly, the silent injection of code snippets via Retrieval-Augmented Generation (RAG) from the codebase index.

Mismanagement of this context is the principal source of excessive token burn. For example, a seemingly simple query in Cursor can trigger a background RAG process that injects thousands of tokens of code into the prompt before the user's text is even considered, leading to unexpectedly high costs for minor tasks.1 Similarly, long-running chat sessions accumulate a significant token burden from conversation history, which is re-processed with every new turn.3

Optimization, therefore, is not a matter of writing shorter prompts but of practicing disciplined **context management**. The most effective strategies involve shifting from a reliance on the tool's automated context retrieval to a workflow based on deliberate, minimal, and explicit context provision. This report provides a detailed playbook to achieve this, transforming the developer's role from a passive querent into an active and efficient context manager.

### **2\. Top-10 Optimization Quick Wins**

The following tactics represent the most impactful changes a developer can make to immediately reduce token consumption, ranked by their estimated savings potential.

| Rank | Tactic | Estimated % Savings (Range) | Confidence | Primary Tool |
| :---- | :---- | :---- | :---- | :---- |
| 1 | **Start New Chats for New Tasks** | 50% \- 90% | High | Cursor, Codex |
| 2 | **Prefer Explicit Context (@Code, @Git) over Implicit RAG** | 40% \- 80% | High | Cursor |
| 3 | **Implement Provider-Side Prompt Caching via API** | 30% \- 75% | High | Codex (API) |
| 4 | **Enforce a Strict Token Budget on .cursor/rules Files (≤1,200 tokens)** | 20% \- 60% | High | Cursor |
| 5 | **Disable "Full Folder Content" and Attach Files Manually & Sparingly** | 20% \- 50% | High | Cursor |
| 6 | **Decompose Large Tasks into Small, Atomic Steps** | 20% \- 94% (GPT-5-Codex) | High | Codex (Agent) |
| 7 | **Use max\_tokens and stop Sequences in API Calls** | 10% \- 40% | High | Codex (API) |
| 8 | **Use Manual or Auto Attached Rule Types Instead of Always** | 10% \- 30% | Medium | Cursor |
| 9 | **Use Terse, Non-Verbose Prompts ("No rationale," "Code only")** | 5% \- 20% | Medium | Cursor, Codex |
| 10 | **Disable "Max Mode" by Default** | 5% \- 15% | High | Cursor |

### **3\. The "Before You Hit Enter" Checklist**

For daily use, this checklist helps build cost-aware habits.

* **\[ \] Is this a new, distinct task?**  
  * If YES, start a new chat (Cmd+T in Cursor Agent). Do not continue a long, unrelated conversation.  
* **\[ \] Am I asking a general codebase question?**  
  * If YES, am I prepared for the high token cost of RAG? Can I instead find the relevant code and use @Code or copy-paste a snippet?  
* **\[ \] Have I attached any files or folders?**  
  * If YES, are they essential? Is each file under 20 KB? Have I used @Code for snippets or @Git @Commit for diffs instead of attaching full files?  
* **\[ \] Is my .cursor/rules file active and lean?**  
  * Is it under 1,200 tokens? Am I using an Always rule that could be scoped with a glob pattern instead?  
* **\[ \] Does my prompt ask for an explanation?**  
  * If NO, add "No rationale, return code only." to the end of the prompt to cut down on verbose output.  
* **\[ \] (API Users) Is my prompt structured for caching?**  
  * Is the large, static system prompt at the beginning and the small, dynamic user query at the end?

---

## **Part B: The Token Optimization Playbook**

### **Section 1: Disambiguation: The "Codex" Landscape in 2025**

To effectively optimize token usage, it is critical to first disambiguate the term "Codex." As of September 2025, it has evolved from a single model name into a multifaceted ecosystem. The term now refers to four distinct but related concepts.

#### **1.1. Meaning 1: The Modern OpenAI Codex Agent**

The primary definition of "Codex" today is an **AI software engineering agent**.4 This is a cloud-based service that operates in an isolated, sandboxed environment to perform complex, asynchronous coding tasks.6 Developers delegate work like implementing features, fixing bugs, or generating pull requests. The agent can read and edit files, run commands, and execute tests autonomously.6 It is accessible through the ChatGPT web interface, an official CLI (

$ npm i \-g @openai/codex), and IDE extensions.8 Its behavior can be guided by project-specific

AGENTS.md files placed in the repository, which provide instructions on testing, architecture, and conventions.6

#### **1.2. Meaning 2: The GPT-5-Codex Model**

This is the **specialized LLM** that powers the modern Codex agent.10 It is a purpose-built version of GPT-5, fine-tuned on real-world software engineering tasks using reinforcement learning.6 Its key feature is

**adaptive reasoning**: it dynamically allocates computational effort based on task complexity. For simple requests, it uses significantly fewer resources—up to 93.7% fewer tokens than the general GPT-5 model.10 For complex, multi-file refactoring, it can invest more time and resources, operating for hours if needed.10 This model requires a more minimal, direct prompting style and is not a drop-in replacement for GPT-5.14

#### **1.3. Meaning 3: GitHub Copilot (as a "Codex" Implementation)**

GitHub Copilot is the most widely adopted **IDE integration** that utilizes the Codex family of models, including the new GPT-5-Codex.11 While OpenAI develops the core models, GitHub (a Microsoft subsidiary) packages them into the Copilot product, which provides real-time, in-editor code completions, chat, and agentic features.16 For millions of developers, Copilot is the primary interface through which they interact with "Codex" technology, even if they don't use the standalone OpenAI agent or CLI.

#### **1.4. Meaning 4: Third-Party and Legacy "Codex" Tools**

This category includes:

* **Legacy Models:** The original OpenAI Codex models (e.g., code-davinci-002) were retired in March 2023\.18 Any reference to these is historical.  
* **Third-Party CLIs/Agents:** The success of the "Codex" name has inspired a range of competing and complementary tools from other companies. These include Google's Gemini Code Assist, Anthropic's Claude Code CLI, and Sourcegraph's Amp, which offer similar agentic, command-line coding capabilities.7 It is important to distinguish these from OpenAI's official offerings.

### **Section 2: Deep Dive: Core Token Consumption Mechanics**

Understanding token consumption requires a shift in perspective from per-request to per-session economics. The introduction of caching and the sheer volume of automated context are the dominant factors.

#### **2.1. The Four-Part Token Economy: Input, Output, Cache Write, and Cache Read**

Cursor's transparent accounting model provides a clear framework for understanding token flow, which mirrors the underlying mechanics of provider APIs.3 Every interaction involves up to four token types:

1. **Input Tokens:** The raw text sent to the model. This includes the user's prompt, attached files, active rules, and conversation history.  
2. **Output Tokens:** The raw text generated by the model in response. These are typically 2-4x more expensive than input tokens because generation is more computationally intensive than processing.21  
3. **Cache Write Tokens:** When new context (like the first message in a chat or a tool call result) is processed, it can be written to a temporary cache. This incurs a cost similar to input tokens.1  
4. **Cache Read Tokens:** On subsequent turns in the same conversation, previously cached context (like chat history) is re-sent to the model. However, because it's already been processed, it is billed at a significantly reduced rate—typically 10-25% of the standard input token cost.3

This model reveals that the highest cost is incurred at the start of a session when context is first established. The goal of optimization is to amortize this initial high cost over a long, productive session by maximizing the use of cheap Cache Read tokens for relevant context, and aggressively starting new sessions to discard irrelevant context.

#### **2.2. Token Sink \#1: System & Developer Prompts (.cursor/rules, AGENTS.md)**

These configuration files provide persistent, system-level instructions to the AI. They are a powerful feature for enforcing standards but represent a constant token tax on every applicable request.

* **Mechanism:** The contents of active rule files are prepended to the model's context window.23 Rules designated as  
  Always are included in every single Chat and Inline Edit request within the project, regardless of the task's relevance to the rule.  
* **Quantification:** A moderately detailed rule file can easily become a major token sink. Cursor's documentation recommends keeping rules under 500 lines.23 A 500-line Markdown file with code examples can easily contain 15,000 characters, which translates to approximately  
  **3,000-4,000 tokens**. If this is an Always rule, every single interaction, no matter how small, is burdened with this 4,000-token overhead.

#### **2.3. Token Sink \#2: Conversation History & Memory**

LLMs are stateless. To simulate memory, the entire conversation history is resent with each new turn.24

* **Mechanism:** In Cursor, after the first turn, this history is largely billed as cheaper Cache Read tokens.3 However, this growing context still consumes the model's finite context window. As the conversation lengthens, it can lead to "context rot," where the model begins to ignore or forget earlier instructions, reducing quality.25 Eventually, it hits the context limit, forcing the user to start a new chat.26  
* **Quantification:** Consider a 10-turn conversation where each turn (user prompt \+ AI response) averages 2,000 tokens. By the 11th turn, there are **20,000 tokens** of history being re-processed. While billed cheaply as Cache Read, this still represents a significant portion of the available context window (e.g., a 200k window is already 10% full).

#### **2.4. Token Sink \#3: Codebase Index / RAG Retrieval**

This is the most significant and often invisible source of token consumption. Cursor's ability to answer questions about the entire codebase is powered by RAG, which finds and injects relevant code snippets into the prompt automatically.28

* **Mechanism:** When a user asks a general question without attaching specific files, Cursor performs a semantic search against its vector index of the codebase. It retrieves the most relevant chunks of code (the "top-k" results) and stuffs their full content into the prompt before sending it to the LLM.30 The user only sees their question, but the model sees the question plus thousands of tokens of retrieved code.  
* **Quantification:** While Cursor's exact RAG parameters are not public 32, we can model the cost based on industry standards.33  
  * **Small Case:** A conservative retrieval of k=3 chunks, each 300 tokens in size, silently adds 3×300=900 tokens.  
  * **Medium Case:** A typical retrieval of k=5 chunks of 512 tokens each adds 5×512=2,560 tokens.  
  * Large Case: An aggressive retrieval of k=10 chunks of 1,200 tokens each adds 10×1,200=12,000 tokens.  
    This automated injection is the most likely explanation for user reports of simple edits consuming over 100,000 tokens, as multiple RAG-powered tool calls could occur within a single agentic task.2

#### **2.5. Token Sink \#4: Attachments & File Previews (@file, @folder)**

Manually attaching files provides explicit context but at a direct and often steep token cost.

* **Mechanism:** When a file is referenced with @file, its entire content is inlined into the prompt context.32 For files or folders that exceed the context window, Cursor attempts to condense them, but this is a lossy summarization that can omit critical details.25  
* **Quantification:** The cost is directly proportional to file size. A common rule of thumb is that 1 token is approximately 4 characters of code.  
  * **Small File (20 KB):** A 20,000-character file translates to roughly **5,000 input tokens**.  
  * **Medium File (100 KB):** A 100,000-character file adds **25,000 input tokens**.  
  * **Large File (1 MB):** A 1,000,000-character file would require **250,000 tokens**, exceeding the default context window of most models and forcing aggressive, unreliable condensation.35

#### **2.6. Token Sink \#5: Tool/Function Call I/O**

In agentic workflows, the conversation between the LLM and its tools (e.g., the terminal) is explicitly recorded in the context history, consuming tokens.

* **Mechanism:** When an agent decides to run a command, the tool call itself (a structured JSON object) and the full stdout/stderr response from the tool are appended to the conversation.3 This allows the model to reason based on the outcome of its actions.  
* **Quantification:** A simple command like git status might only add 100-200 tokens. However, a command that fails, such as a test runner, can return a multi-page stack trace adding **5,000-10,000 tokens** of error logs to the context for the next reasoning step.14

### **Section 3: Cursor Optimization Guide (Windows Workflow)**

This section provides actionable settings, patterns, and workflows for minimizing token consumption within the Cursor editor on a Windows desktop.

#### **3.1. Foundational Settings Configuration**

Configuring Cursor's settings correctly establishes a baseline of cost control, shifting defaults from "maximum automation" to "maximum efficiency."

| Setting Name (UI Path) | Recommended Value | Rationale / Impact on Tokens |
| :---- | :---- | :---- |
| Settings \> Indexing & Docs \> Automatic Indexing | Off | Prevents automatic indexing of every opened project. This gives the developer manual control to only index repositories where codebase-wide RAG is explicitly needed, saving on initial embedding costs and preventing accidental RAG on large, non-essential projects.29 |
| Settings \> Features \> Web Search | Off | Disables web search by default. It can still be invoked manually with @Web. This prevents the agent from making unexpected web queries that fetch and inject large amounts of text from web pages into the context.32 |
| Settings \> Context \> Full Folder Content | Off | When @Folders is used, this setting prevents Cursor from attempting to inline the content of *every file* within that folder. This is one of the most dangerous settings for token consumption and should be disabled.32 |
| Model Selector \> Max Mode | Off (by default) | Max Mode enables the full 1M+ token context windows of models like Gemini 2.5 Pro.36 This is significantly more expensive and slower. It should be enabled deliberately for specific, large-context tasks, not used as a default setting.37 |

#### **3.2. Mastering Rules (.cursor/rules & AGENTS.md): The 1,200-Token Budget**

Project rules are a primary source of "context tax." A disciplined approach is essential.

* **Best Practices:**  
  * **Enforce a Budget:** Adhere to a strict budget of **1,200 tokens** (approximately 500 lines or 4,800 characters) for any single rule file, especially those that are frequently applied.23  
  * **Avoid Always:** The Always rule type is the most expensive. Prefer Auto Attached which scopes the rule to files matching a glob pattern, or Manual which requires explicit invocation (@ruleName).23  
  * **Decompose:** Break down monolithic rule files into smaller, more focused rules scoped to specific parts of the codebase (e.g., a frontend.mdc rule and a backend.mdc rule).  
  * **Use AGENTS.md for Simplicity:** For high-level, human-readable instructions, AGENTS.md is a simpler and often more token-efficient alternative to the structured .mdc format.23  
* **Example: Optimizing a Rule File**  
  * **Before (Verbose, \~150 tokens):** *"As an expert AI assistant, you should always ensure that any new React components you generate strictly adhere to our team's coding standards. Please use functional components with TypeScript hooks. Make sure to destructure props for clarity and always define styles in a separate styles.ts file using styled-components. Avoid inline styles at all costs."*  
  * **After (Optimized, \~60 tokens):**  
    \#\# React Component Standards  
    \- Language: TypeScript  
    \- Component Type: Functional with Hooks ONLY.  
    \- Props: Always destructure.  
    \- Styling: Use styled-components in a separate \`styles.ts\` file.  
    \- Prohibited: Inline styles, Class components.

#### **3.3. Taming the RAG Engine: From Firehose to Pipette**

The most significant token savings come from controlling Cursor's automated RAG. The guiding principle is to *always prefer explicit, minimal context over implicit, automated retrieval*.

* **The Optimal Workflow:**  
  1. **Default to @Code:** For any targeted edit, refactor, or question about a specific piece of logic, select the relevant code block (e.g., a function, a class) and use the @Code symbol in the chat or inline edit prompt. This provides precise, minimal context instead of relying on a broad semantic search.32  
  2. **Use @Git for Changes:** When asking for a code review or generating tests for recent work, use @Git @Commit to provide the concise unified diff of staged changes, or @Git @Branch to show the diff against the main branch. This is far more token-efficient than attaching multiple full files.32  
  3. **Use @file Deliberately:** Only attach a full file with @file when the task genuinely requires the entire file's context and the file is small (e.g., under 20 KB / 5,000 tokens).  
  4. **Reserve General Queries for Discovery:** Only ask broad, open-ended questions like "How does our authentication system work?" when performing an initial exploration of an unfamiliar codebase and are willing to pay the high token cost of the resulting RAG query.

#### **3.4. The Autonomy vs. Cost Trade-off**

Cursor's most powerful features, like its autonomous Agent mode, are also its most token-intensive.38 This creates a direct trade-off between developer convenience and cost. The key to navigating this is to consciously choose the right level of AI autonomy for the task at hand.

* **High Autonomy / High Cost:** Use the full Agent mode for complex, multi-file tasks where the goal is to generate a novel solution or perform a large-scale refactor. The high token cost is justified by the significant productivity gain and the reduction in human effort.  
* **Low Autonomy / Low Cost:** Use manual context management (@Code, @Git) and targeted inline edits (Cmd+K) for routine, well-defined tasks like fixing a bug in a known function, adding a unit test, or refactoring a small component. Here, efficiency and predictability are paramount.

By framing this as a conscious choice, developers can avoid the frustration of unexpectedly high token bills for simple tasks, which often stems from using a high-autonomy tool for a low-autonomy job.40

#### **3.5. Verification and Measurement**

To validate these optimization strategies, developers must monitor their consumption.

* **Primary Tool:** The Cursor Dashboard is the source of truth. Navigate to **Dashboard \> Usage** to see a request-by-request breakdown of token consumption.3  
* **What to Look For:** The dashboard breaks down usage by Input, Output, Cache Write, and Cache Read tokens for each interaction.3 If a "simple" request shows a massive number of  
  Input tokens, it is almost certainly due to an automated RAG retrieval or a large file attachment. Use this feedback to refine your context-providing habits.

### **Section 4: "Codex" Optimization Guide (CLI & API)**

When using the OpenAI Codex agent via its CLI or interacting with code-capable models directly through APIs, a different set of optimization techniques becomes critical.

#### **4.1. Leveraging GPT-5-Codex's Adaptive Reasoning**

The GPT-5-Codex model is architecturally designed for token efficiency, a feature that must be actively leveraged. Its ability to use up to 94% fewer tokens on simple tasks creates a powerful incentive for **task decomposition**.10

* **Optimal Strategy:** Instead of sending a single, monolithic prompt describing a complex feature, break the problem down into the smallest possible, independently verifiable steps. Feed these atomic tasks to the Codex agent sequentially. This aligns best practices in software engineering (small, incremental changes) with cost optimization.  
* **Prompting Style:** GPT-5-Codex performs best with minimal, direct prompts. Avoid the long preambles, role-playing instructions, and chain-of-thought examples often used with general-purpose models. The official OpenAI prompting guide for the model should be treated as the reference implementation.14

#### **4.2. Mastering Provider-Side Prompt Caching**

For API-level interactions, prompt caching is the single most powerful optimization technique. All major providers offer a form of it, but the mechanisms differ. The core principle is that the model can skip re-processing the beginning (prefix) of a prompt if it has seen that exact prefix recently.42

* **Implementation Guide:**  
  * **OpenAI (gpt-4o, gpt-5-codex):**  
    * **Mechanism:** Caching is **automatic** for prompts with a prefix of 1024 tokens or more. The system routes requests with identical prefixes to servers that have the prefix's intermediate state (the K-V cache) already computed.42 No code changes are needed to enable it, but prompts must be structured correctly.  
    * **Best Practice:** Structure your code to create a stable prefix. Place the long, unchanging system prompt and tool definitions at the beginning of your message array, and the dynamic user query at the end.  
    * **Example (Python):**  
      Python  
      \# Stable prefix (over 1024 tokens)  
      stable\_system\_prompt \= "You are an expert Python developer..." \# (and much more)

      \# First call (establishes cache)  
      response1 \= client.chat.completions.create(  
          model="gpt-5-codex",  
          messages=  
      )  
      \# In response1.usage.prompt\_tokens\_details, cached\_tokens will be 0

      \# Second call (hits cache)  
      response2 \= client.chat.completions.create(  
          model="gpt-5-codex",  
          messages=\[  
              {"role": "system", "content": stable\_system\_prompt},  
              {"role": "user", "content": "Now write a test for that function."} \# New dynamic part  
          \]  
      )  
      \# In response2.usage.prompt\_tokens\_details, cached\_tokens will be \> 1024

  * **Anthropic (claude-3.5-sonnet):**  
    * **Mechanism:** Caching is **explicit**. The developer must include the anthropic-beta: prompt-caching-2024-07-31 header and use the cache\_control parameter to mark the end of the cacheable content. Cache writes cost 25% more than standard input tokens, but cache reads are 90% cheaper.44  
    * **Example (Python):**  
      Python  
      import anthropic

      client \= anthropic.Anthropic()

      \# The part of the prompt to be cached  
      cached\_prompt\_part \=

      response \= client.beta.prompt\_caching.messages.create(  
          model="claude-3-5-sonnet-20240620",  
          messages=,  
          max\_tokens=1024,  
      )  
      \# response.usage will show cache\_creation\_input\_tokens on first call  
      \# and cache\_read\_input\_tokens on subsequent calls with the same prefix

  * **Google Gemini (gemini-2.5-pro):**  
    * **Mechanism:** Google offers two modes. **Implicit caching** works automatically like OpenAI's for prefixes \>2048 tokens.46  
      **Explicit caching** allows you to create a CachedContent object with a specific Time-To-Live (TTL), which can be reused across many different requests. This is ideal for very stable, long-term context like a large document or codebase summary.46  
    * **Example (Python \- Explicit Caching):**  
      Python  
      import google.generativeai as genai

      \# 1\. Create the cache  
      cache \= genai.caching.CachedContent.create(  
          model="models/gemini-2.5-pro",  
          display\_name="my\_codebase\_summary\_cache",  
          system\_instruction="Analyze the following Python code...",  
          contents=\[...\], \# Large codebase content  
          ttl="600s" \# Time-to-live of 10 minutes  
      )

      \# 2\. Use the cache in a request  
      model \= genai.GenerativeModel.from\_cached\_content(cached\_content=cache)  
      response \= model.generate\_content("Find any security vulnerabilities in this code.")  
      \# The tokens from the cached content are billed at a reduced rate.

#### **4.3. API Best Practices**

* **Log All Tokens:** Programmatically log the usage object from every API response. This object contains the precise counts for prompt\_tokens, completion\_tokens, and any caching details. This is non-negotiable for cost monitoring.  
* **Use max\_tokens:** Always set a reasonable max\_tokens value for the completion. This acts as a hard ceiling, preventing the model from generating an unexpectedly long (and expensive) response.  
* **Use stop Sequences:** If you only need a specific output format (e.g., a JSON object, a code block), provide a stop sequence (e.g., \\n\\n, """) to instruct the model to halt generation immediately after it has finished, cutting off verbose explanations or conversational filler.

### **Section 5: Model & Provider Comparison for Token Efficiency**

Choosing a model based solely on its advertised price-per-token is insufficient. The underlying mechanics of context handling, caching, and reasoning have a greater impact on total cost.

#### **5.1. A Mechanics-Based Comparison**

| Provider/Model | Max Context Window (Default / Max) | Caching Mechanism | Typical Verbosity | Key Token Driver(s) |
| :---- | :---- | :---- | :---- | :---- |
| **OpenAI GPT-5-Codex** | 272k / 272k 35 | Automatic prefix caching (\>1024 tokens) 42 | Low (optimized) | Adaptive reasoning (highly efficient on simple tasks); tool call I/O in agentic loops. |
| **OpenAI GPT-5** | 272k / 272k 35 | Automatic prefix caching (\>1024 tokens) 42 | Medium-High | Verbose chain-of-thought reasoning; less optimized for atomic coding tasks. |
| **Anthropic Claude 4.1 Opus** | 200k / 200k 35 | Explicit via cache\_control header/param 44 | High | Tendency for long, explanatory preambles ("Here is the code you requested..."); large context analysis. |
| **Google Gemini 2.5 Pro** | 200k / 1M 35 | Implicit (auto) and Explicit (CachedContent objects) 46 | Medium | Multi-modal inputs (video/audio) can consume massive tokens; large context window can be filled quickly if not managed. |

#### **5.2. When Bigger Context Helps vs. Hurts**

Models with massive context windows (1M+ tokens) are powerful but present a dangerous cost trap.

* **When it Helps:** For tasks requiring a holistic understanding of a very large, monolithic codebase or document (e.g., "Analyze this entire 500-page PDF for inconsistencies"), a large context window is indispensable. It allows the entire artifact to be processed in a single pass.  
* **When it Hurts:**  
  * **Cost:** Filling a 1M token context window, even once, is extremely expensive.  
  * **Quality Degradation:** Research shows that model accuracy can decline as the context window grows. The "lost in the middle" problem, where models pay less attention to information in the middle of a long context, is a known issue.25 Performance on a 1M token prompt may be worse than on a well-crafted 128k token prompt.  
  * **The RAG Fallacy:** It is often more effective and cheaper to use a smaller context window with a highly efficient RAG system that retrieves only the 5-10 most relevant chunks, rather than naively stuffing the entire document into the prompt.

For most day-to-day coding tasks, a default 200k context window is more than sufficient. "Max Mode" should be a scalpel, not a sledgehammer.

### **Section 6: "Do This Now": 12-Point Action Plan for Pierre**

This prioritized list summarizes the most critical actions from this report for a Windows-based developer using Cursor and API/CLI tools.

1. **Set a Calendar Reminder (Weekly):** Review your Cursor **Dashboard \> Usage** to identify your top 3 most token-intensive interactions from the past week.  
2. **Start Your Next Task in a New Chat:** Make this your default behavior. Use Cmd+T in Cursor's Agent panel.  
3. **Reconfigure Cursor Settings Now:** Immediately set Automatic Indexing to Off, Web Search to Off, and Full Folder Content to Off as detailed in Section 3.1.  
4. **Audit Your .cursor/rules:** Open your primary project's .cursor/rules directory. If any file is over 1,200 tokens, refactor it today. Change any non-essential Always rules to Auto Attached.  
5. **Change Your Default Workflow:** For the next three coding tasks, force yourself to use only @Code and @Git @Commit for context. Avoid general queries and full file attachments.  
6. **(API Users) Refactor One API Call:** Pick one recurring API call and restructure it to have a stable prefix of \>1024 tokens and a dynamic suffix to leverage automatic prompt caching.  
7. **Add max\_tokens to All API Calls:** As a safety measure, add a max\_tokens parameter (e.g., 4096\) to all your API completion requests to prevent runaway generation.  
8. **Switch to the GPT-5-Codex Model:** For any tasks using the OpenAI Codex CLI or API, switch the model from gpt-5 to gpt-5-codex and adopt the minimal prompting style.  
9. **Bookmark the Provider Caching Docs:** Save the links for OpenAI, Anthropic, and Google's prompt caching documentation for quick reference.  
10. **Create a "No Rationale" Snippet:** Create a text snippet No rationale, return code only. and practice appending it to prompts where you don't need an explanation.  
11. **Practice with the Measurement Protocol:** Run the "Baseline" and "Long rule" experiments from the Appendix to get a tangible feel for how rules impact your token count.  
12. **Explicitly Disable "Max Mode":** Check your Cursor model selector and ensure "Max Mode" is turned off. Only enable it when you have a specific task that requires analyzing more than \~15,000 lines of code at once.

---

## **Appendix**

### **A. Reproducible Measurement Protocol**

This protocol defines a 10-experiment matrix to measure token consumption under various conditions. For each experiment, use the same base task (e.g., "Refactor the calculate\_metrics function in utils.py to use numpy arrays instead of lists"). Record results in a CSV file with the following layout.

CSV Layout:  
Experiment\_ID,Description,Prompt\_Tokens,Completion\_Tokens,Cache\_Read\_Tokens,Total\_Tokens,Latency\_ms,Quality\_Notes  
**Test Matrix:**

1. **Baseline:** Short rule file (\<500 tokens), no chat history, attach one relevant file (utils.py).  
2. **Long Rule:** Same as baseline, but with a long, verbose rule file (\>3,000 tokens) set to Always.  
3. **RAG (High-k):** Ask a general question ("How can I optimize the metrics calculation in this project?") with no files attached, forcing RAG. Note if the tool exposes top-k or chunk size settings.  
4. **RAG (Low-k / Explicit):** Ask the same question as \#3, but manually attach only utils.py.  
5. **Attachment (Large):** Attach a large, semi-relevant file (e.g., 100 KB documentation file) along with utils.py.  
6. **Full-File vs. Diff:** Generate a change. First, prompt for the full, modified file. Second, in a new chat, prompt for a unified diff with 3 context lines.  
7. **Tool Call:** Use an agentic prompt that requires a terminal command (e.g., "Install numpy and then refactor...").  
8. **Verbose Rationale:** Add "Explain your reasoning step-by-step in detail before providing the code." to the baseline prompt.  
9. **API Prompt Caching:** (For API users) Run the same API call twice with a stable prefix \>1024 tokens. Record metrics for the first (cache miss) and second (cache hit) calls.  
10. **Long Conversation:** Conduct a 10-turn conversation refining the initial refactoring. Record the token counts for the 11th message.

Example Filled Row:  
exp\_02,"Long rule (\>3k tokens)",5250,1230,0,6480,2500,"Correct refactor, but initial prompt was slow to process due to large rule file."

### **B. Token-Saving Pattern Library**

**1\. .cursor/rules Template (Target: ≤800 tokens)**

Extrait de code

\---  
description: Core project standards for Python backend services.  
globs: \["api/\*\*/\*.py", "services/\*\*/\*.py"\]  
type: Auto Attached  
\---

\# Python Backend Rules

\#\# 1\. Priorities  
\- \*\*Correctness First:\*\* Code must pass all linting and unit tests.  
\- \*\*Readability Second:\*\* Follow PEP 8\. Use clear variable names.  
\- \*\*Performance Third:\*\* Avoid premature optimization.

\#\# 2\. Dependencies  
\- Use \`Poetry\` for dependency management.  
\- Prohibited libraries: \`requests\` (use \`httpx\` instead).

\#\# 3\. API Design  
\- Endpoints must use FastAPI.  
\- All endpoints require Pydantic models for request/response bodies.  
\- Use \`snake\_case\` for all JSON fields.

\#\# 4\. Output Format  
\- For new functions, include a Google-style docstring.  
\- Do not add inline comments unless logic is non-obvious.  
\- Return code blocks using \` \`\`\`python \`.

**2\. Diff-Only Generation Prompt**

Apply the requested changes. Your entire response MUST be only a single code block containing a unified diff. Use \--- a/file.path and \+++ b/file.path. Provide no more than 3 lines of context (-3,4 \+3,4). Do not include any explanation or preamble.

**3\. RAG Limiter Prompt (for general questions)**

Answer the following question about the codebase. To do so, retrieve no more than the top 3 most relevant code snippets. Each snippet should be no more than 600 tokens. In your answer, first cite the file path and line number for each snippet, then provide your analysis. Do not paste the full content of large files.

**4\. Attachment Summary Micro-Prompt**

I am attaching the file \[file\_path\]. Do not read the whole file. Instead, summarize its purpose and key exports in under 150 tokens, then await further instructions.

**5\. No-Rationale Micro-Prompt Suffix**

...\[end of your prompt\]. No rationale. Provide a bulleted plan of ≤60 tokens, then provide the code only.

### **C. Annotated Sources**

1. 3 forum.cursor.com \- Understanding LLM Token Usage:  
   The single most important primary source detailing Cursor's four-part token economy (Input, Output, Cache Write, Cache Read). Confirms that context from rules, files, and history are major drivers of Input tokens.  
2. 23 cursor.com/docs \- Rules:  
   Official documentation explaining how .cursor/rules files work, including the different application types (Always, Auto Attached, etc.). Confirms rules are prepended to model context.  
3. 25 cursor.com/learn \- Context Management:  
   Explains the concept of context degradation ("context rot") in long conversations and acknowledges that model performance can decrease with very large context windows.  
4. 2 forum.cursor.com \- Why is a simple edit eating 100,000+ tokens?:  
   A critical community report demonstrating the "invisible" token cost of RAG, where a single-file edit consumed massive tokens, likely due to repeated, full-file context injection.  
5. 1 reddit.com/r/cursor \- Understanding Cursor Token Usage:  
   A user-generated analysis that correctly identifies context (especially auto-selected files) as the primary token burner, not the user's prompt.  
6. 6 openai.com \- Introducing Codex (2025):  
   The official announcement clarifying the modern "Codex" as a cloud-based software engineering agent, distinct from the legacy models. Mentions the use of AGENTS.md files.  
7. 10 infoq.com, devops.com \- GPT-5-Codex Efficiency:  
   News reports confirming the "adaptive reasoning" of GPT-5-Codex and quantifying its token efficiency, using up to 94% fewer tokens on simple tasks compared to GPT-5.  
8. 14 cookbook.openai.com \- GPT-5-Codex Prompting Guide:  
   Official developer guidance stating that GPT-5-Codex requires a minimal prompting style and is not a drop-in replacement for other models.  
9. 42 platform.openai.com \- Prompt Caching:  
   The primary technical document explaining OpenAI's automatic prompt prefix caching, its requirements (\>1024 tokens), and best practices for structuring prompts.  
10. 44 medium.com \- Unlocking Efficiency... Claude Prompt Caching:  
    A practical guide detailing Anthropic's explicit prompt caching mechanism, including the cache\_control parameter and the unique pricing for cache writes/reads.  
11. 46 ai.google.dev \- Gemini API Caching:  
    Official documentation for Google's dual caching system, explaining both the automatic "implicit" caching and the more controllable "explicit" CachedContent object creation.  
12. 32 cursor.com/docs \- @ Symbols:  
    Documentation detailing how context is added in Cursor, confirming that @file references the entire file and that Full Folder Content is a high-cost option.  
13. 29 cursor.com/docs \- Codebase Indexing:  
    Confirms that Cursor indexes the entire codebase to power its semantic search (RAG) capabilities, which enables context-aware suggestions.

#### **Sources des citations**

1. Understanding Cursor Token Usage: What I've Learned So Far \- Reddit, consulté le septembre 24, 2025, [https://www.reddit.com/r/cursor/comments/1m29nf1/understanding\_cursor\_token\_usage\_what\_ive\_learned/](https://www.reddit.com/r/cursor/comments/1m29nf1/understanding_cursor_token_usage_what_ive_learned/)  
2. Why is a simple edit eating 100000+ tokens? Let's talk about this \- Cursor Forum, consulté le septembre 24, 2025, [https://forum.cursor.com/t/why-is-a-simple-edit-eating-100-000-tokens-let-s-talk-about-this/120025](https://forum.cursor.com/t/why-is-a-simple-edit-eating-100-000-tokens-let-s-talk-about-this/120025)  
3. Understanding LLM Token Usage \- How To \- Cursor \- Community Forum, consulté le septembre 24, 2025, [https://forum.cursor.com/t/understanding-llm-token-usage/120673](https://forum.cursor.com/t/understanding-llm-token-usage/120673)  
4. www.appmaisters.com, consulté le septembre 24, 2025, [https://www.appmaisters.com/openai-codex-cloud-based-coding-agent-with-internet-access/\#:\~:text=What%20%E2%80%9CCodex%E2%80%9D%20Means%20in%202025,coding%20assistants%20in%20the%20cloud.](https://www.appmaisters.com/openai-codex-cloud-based-coding-agent-with-internet-access/#:~:text=What%20%E2%80%9CCodex%E2%80%9D%20Means%20in%202025,coding%20assistants%20in%20the%20cloud.)  
5. Codex Open AI: The Ultimate Guide to AI-Powered Coding in 2025 \- Emelia, consulté le septembre 24, 2025, [https://emelia.io/hub/codex-open-ai](https://emelia.io/hub/codex-open-ai)  
6. Introducing Codex | OpenAI, consulté le septembre 24, 2025, [https://openai.com/index/introducing-codex/](https://openai.com/index/introducing-codex/)  
7. Claude Code vs OpenAI Codex: which is better in 2025? | Blog \- Northflank, consulté le septembre 24, 2025, [https://northflank.com/blog/claude-code-vs-openai-codex](https://northflank.com/blog/claude-code-vs-openai-codex)  
8. Codex cloud \- OpenAI Developers, consulté le septembre 24, 2025, [https://developers.openai.com/codex/cloud/](https://developers.openai.com/codex/cloud/)  
9. Codex | OpenAI, consulté le septembre 24, 2025, [https://openai.com/codex/](https://openai.com/codex/)  
10. OpenAI Releases GPT-5-Codex Optimized for Complex Code Refactoring and Code Reviews \- InfoQ, consulté le septembre 24, 2025, [https://www.infoq.com/news/2025/09/gpt-5-codex/](https://www.infoq.com/news/2025/09/gpt-5-codex/)  
11. OpenAI GPT-5-Codex is rolling out in public preview for GitHub Copilot, consulté le septembre 24, 2025, [https://github.blog/changelog/2025-09-23-openai-gpt-5-codex-is-rolling-out-in-public-preview-for-github-copilot/](https://github.blog/changelog/2025-09-23-openai-gpt-5-codex-is-rolling-out-in-public-preview-for-github-copilot/)  
12. OpenAI launches GPT-5-Codex with a 74.5% success rate on real world coding | TechRadar, consulté le septembre 24, 2025, [https://www.techradar.com/pro/openai-launches-gpt-5-codex-with-a-74-5-percent-success-rate-on-real-world-coding](https://www.techradar.com/pro/openai-launches-gpt-5-codex-with-a-74-5-percent-success-rate-on-real-world-coding)  
13. OpenAI's GPT-5-Codex: A Smarter Approach to Enterprise Development \- DevOps.com, consulté le septembre 24, 2025, [https://devops.com/openais-gpt-5-codex-a-smarter-approach-to-enterprise-development/](https://devops.com/openais-gpt-5-codex-a-smarter-approach-to-enterprise-development/)  
14. GPT-5-Codex Prompting Guide \- OpenAI Cookbook, consulté le septembre 24, 2025, [https://cookbook.openai.com/examples/gpt-5-codex\_prompting\_guide](https://cookbook.openai.com/examples/gpt-5-codex_prompting_guide)  
15. OpenAI Codex vs GitHub Copilot: Comparing AI Code Assistant \- Zignuts Technolab, consulté le septembre 24, 2025, [https://www.zignuts.com/blog/openai-codex-vs-github-copilot-comparison](https://www.zignuts.com/blog/openai-codex-vs-github-copilot-comparison)  
16. GitHub Copilot Fundamentals Part 1 of 2 \- Training \- Microsoft Learn, consulté le septembre 24, 2025, [https://learn.microsoft.com/en-us/training/paths/copilot/](https://learn.microsoft.com/en-us/training/paths/copilot/)  
17. GitHub Copilot · Your AI pair programmer, consulté le septembre 24, 2025, [https://github.com/features/copilot](https://github.com/features/copilot)  
18. Codex is legacy? : r/ChatGPT \- Reddit, consulté le septembre 24, 2025, [https://www.reddit.com/r/ChatGPT/comments/1mqi9cl/codex\_is\_legacy/](https://www.reddit.com/r/ChatGPT/comments/1mqi9cl/codex_is_legacy/)  
19. Top Codex CLI Alternatives in 2025 \- Slashdot, consulté le septembre 24, 2025, [https://slashdot.org/software/p/Codex-CLI/alternatives](https://slashdot.org/software/p/Codex-CLI/alternatives)  
20. Top OpenAI Codex Alternatives in 2025 \- Slashdot, consulté le septembre 24, 2025, [https://slashdot.org/software/p/OpenAI-Codex/alternatives](https://slashdot.org/software/p/OpenAI-Codex/alternatives)  
21. Tokens & Pricing | Cursor Learn, consulté le septembre 24, 2025, [https://cursor.com/learn/tokens-pricing](https://cursor.com/learn/tokens-pricing)  
22. Cursor Auto Mode: Excessive Token Usage \- Bug Reports, consulté le septembre 24, 2025, [https://forum.cursor.com/t/cursor-auto-mode-excessive-token-usage/123899](https://forum.cursor.com/t/cursor-auto-mode-excessive-token-usage/123899)  
23. Rules | Cursor Docs, consulté le septembre 24, 2025, [https://cursor.com/docs/context/rules](https://cursor.com/docs/context/rules)  
24. Context | Cursor Learn, consulté le septembre 24, 2025, [https://cursor.com/learn/context](https://cursor.com/learn/context)  
25. Context Management | Cursor Learn, consulté le septembre 24, 2025, [https://cursor.com/learn/context-management](https://cursor.com/learn/context-management)  
26. "Your conversation is too long. Please try creating a new conversation or shortening your messages." : r/cursor \- Reddit, consulté le septembre 24, 2025, [https://www.reddit.com/r/cursor/comments/1mmfact/your\_conversation\_is\_too\_long\_please\_try\_creating/](https://www.reddit.com/r/cursor/comments/1mmfact/your_conversation_is_too_long_please_try_creating/)  
27. Request: Visual indicator when context is truncated \- Cursor Forum, consulté le septembre 24, 2025, [https://forum.cursor.com/t/request-visual-indicator-when-context-is-truncated/41007](https://forum.cursor.com/t/request-visual-indicator-when-context-is-truncated/41007)  
28. What is Cursor AI? Everything You Need to Know | UI Bakery Blog, consulté le septembre 24, 2025, [https://uibakery.io/blog/what-is-cursor-a](https://uibakery.io/blog/what-is-cursor-a)  
29. Codebase Indexing | Cursor Docs, consulté le septembre 24, 2025, [https://cursor.com/docs/context/codebase-indexing](https://cursor.com/docs/context/codebase-indexing)  
30. Concepts | Cursor Docs, consulté le septembre 24, 2025, [https://cursor.com/docs/get-started/concepts](https://cursor.com/docs/get-started/concepts)  
31. An attempt to build cursor's @codebase feature \- RAG on codebases \- part 1/2, consulté le septembre 24, 2025, [https://blog.lancedb.com/rag-codebase-1/](https://blog.lancedb.com/rag-codebase-1/)  
32. @ Symbols | Cursor Docs, consulté le septembre 24, 2025, [https://cursor.com/docs/context/symbols](https://cursor.com/docs/context/symbols)  
33. What is the optimal chunk size for RAG applications? \- Milvus, consulté le septembre 24, 2025, [https://milvus.io/ai-quick-reference/what-is-the-optimal-chunk-size-for-rag-applications](https://milvus.io/ai-quick-reference/what-is-the-optimal-chunk-size-for-rag-applications)  
34. Building first RAG system \- API \- OpenAI Developer Community, consulté le septembre 24, 2025, [https://community.openai.com/t/building-first-rag-system/1289548](https://community.openai.com/t/building-first-rag-system/1289548)  
35. Models | Cursor Docs, consulté le septembre 24, 2025, [https://cursor.com/docs/models](https://cursor.com/docs/models)  
36. Max Mode | Cursor Docs, consulté le septembre 24, 2025, [https://cursor.com/docs/context/max-mode](https://cursor.com/docs/context/max-mode)  
37. Extreme token usage \- Page 2 \- Discussions \- Cursor \- Community Forum, consulté le septembre 24, 2025, [https://forum.cursor.com/t/extreme-token-usage/117870?page=2](https://forum.cursor.com/t/extreme-token-usage/117870?page=2)  
38. Cursor: The best way to code with AI, consulté le septembre 24, 2025, [https://cursor.com/](https://cursor.com/)  
39. What is Cursor AI ?: Features and Capabilities | by Tahir | Medium, consulté le septembre 24, 2025, [https://medium.com/@tahirbalarabe2/what-is-cursor-ai-code-editor-features-and-capabilities-bb1f4030e42c](https://medium.com/@tahirbalarabe2/what-is-cursor-ai-code-editor-features-and-capabilities-bb1f4030e42c)  
40. Cursor's “Unlimited” Promise: A Bridge Too Far for Some Users? | by Tim Chosen | Medium, consulté le septembre 24, 2025, [https://timchosen.medium.com/cursors-unlimited-promise-a-bridge-too-far-for-some-users-8f58a14e4e0e](https://timchosen.medium.com/cursors-unlimited-promise-a-bridge-too-far-for-some-users-8f58a14e4e0e)  
41. Why is a simple edit eating 100000+ tokens? Let's talk about this \- \#41 by condor, consulté le septembre 24, 2025, [https://forum.cursor.com/t/why-is-a-simple-edit-eating-100-000-tokens-let-s-talk-about-this/120025/41](https://forum.cursor.com/t/why-is-a-simple-edit-eating-100-000-tokens-let-s-talk-about-this/120025/41)  
42. Prompt caching \- OpenAI API, consulté le septembre 24, 2025, [https://platform.openai.com/docs/guides/prompt-caching](https://platform.openai.com/docs/guides/prompt-caching)  
43. Prompt Caching with OpenAI, Anthropic, and Google Models \- PromptHub, consulté le septembre 24, 2025, [https://www.prompthub.us/blog/prompt-caching-with-openai-anthropic-and-google-models](https://www.prompthub.us/blog/prompt-caching-with-openai-anthropic-and-google-models)  
44. Unlocking Efficiency: A Practical Guide to Claude Prompt Caching | by Mark Craddock, consulté le septembre 24, 2025, [https://medium.com/@mcraddock/unlocking-efficiency-a-practical-guide-to-claude-prompt-caching-3185805c0eef](https://medium.com/@mcraddock/unlocking-efficiency-a-practical-guide-to-claude-prompt-caching-3185805c0eef)  
45. Prompt caching with Claude \- Anthropic, consulté le septembre 24, 2025, [https://www.anthropic.com/news/prompt-caching](https://www.anthropic.com/news/prompt-caching)  
46. Context caching | Gemini API | Google AI for Developers, consulté le septembre 24, 2025, [https://ai.google.dev/gemini-api/docs/caching](https://ai.google.dev/gemini-api/docs/caching)  
47. Context caching overview | Generative AI on Vertex AI \- Google Cloud, consulté le septembre 24, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/context-cache/context-cache-overview](https://cloud.google.com/vertex-ai/generative-ai/docs/context-cache/context-cache-overview)  
48. Caching | Gemini API | Google AI for Developers, consulté le septembre 24, 2025, [https://ai.google.dev/api/caching](https://ai.google.dev/api/caching)