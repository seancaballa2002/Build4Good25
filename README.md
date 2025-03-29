# 🛠️ Bobby The Handyman

**The hassle-free way to get transparent quotes for your household problems.**

---

## 🚀 About the Project

The classic **“just tell me how much it costs!”** struggle is real. Whether it’s a leaky faucet, a clogged drain, or an electrical issue, handyman pricing can be all over the place—depending on who you ask, what day it is, or even their mood.

**Bobby The Handyman** is a platform that helps users **cross-reference service prices from different providers**. No more guesswork, no more frustration— just clear, comparable quotes.

---

## 🌟 Key Features

- **Multimodal Input**:  
  Users can describe their household problem using **voice, text, image, or even video** (e.g., “My faucet is leaking”).
  _(We’ve seen Gemini analyze video for SnapSell, so this is a promising approach.)_

- **Smart Parsing with LLMs**:  
  We use an **LLM provider** to understand the problem, anticipate follow-up questions a handyman might ask, and prompt the user for confirmation or additional details.

- **Local Pricing Insights**:  
  Before reaching out to providers, we conduct an **initial perplexity search** to estimate how much the repair typically costs in the user’s area.
  - Users can also **input a price range** they are willing to pay.

- **Automated Service Matching & Calling**:  
  Once the problem and price range are set, the system:
  1. **Finds nearby providers** who match the criteria.
  2. **Calls them individually** with the job details.
  3. **Collects quotes & availability**, returning the best options to the user.

---

## 🧩 Example Flow

1. **User describes their issue** → Upload a short video, picture, voice note, or type it out.  
   _Example_: “My faucet is leaking.”

2. **LLM analyzes the input** → Understands the problem and asks for missing details if needed. 

3. **Price Estimation** → Provides a **local pricing range** and lets the user set their **desired budget**.

4. **Provider Search & Automated Calls** → Contacts local handy person, gathers **quotes & availability**.

5. **User receives the best options** → Clear, transparent, and hassle-free!

---

## 🏗️ Tech Stack

- **Next.js** — Frontend framework for a fast, modern UI.
- **LLMs** — Used to analyze, refine, and predict handyman-related queries.
- **[Retell AI](https://www.retellai.com)** — For automated call handling and response collection.

---

## 🤖 Why We Built This

Getting a simple quote for a household repair shouldn't be **complicated or inconsistent**. 
We built **Bobby The Handyman** to make pricing transparent, reduce unnecessary back-and-forth, and help users find reliable service providers quickly.

It also gives local handymen more visibility—especially those who don’t have a website or a presence on major platforms. By streamlining outreach and centralizing quotes, we're creating a space where **small, independent professionals can be seen and selected** based on **clear, fair criteria**.

---

## 🚧 Future Ideas

- Provider onboarding portal for verified professionals
- Dynamic pricing estimator based on historical data
- Direct booking & payment integration
- Live chat with handymen/specialists

---
