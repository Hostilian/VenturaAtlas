# MandateMesh — Business-Wallet Delegation Graph

## Metadata
- **Status:** `DUPLICATE_RESEARCH_UPDATE`
- **Canonical relation:** merge into `idea-341` EntityMandate and `idea-344` MandateCompiler
- **Reset:** RESET XX (2026-08-21)
- **Score:** 7.9 / 10
- **Category:** Identity & Legal Infrastructure
- **Domain:** European Business Wallets / Corporate Authority Graphs

## 1. Executive Summary
MandateMesh builds the versioned, machine-readable delegation graph for European Business Wallets (Council negotiating position adopted June 2026). It solves the complex enterprise question: *"Who has legal authority to sign, seal, or submit this specific transaction on behalf of Company X right now?"*

## 2. The Problem
Enterprise legal authority is dynamic, multi-tiered, and jurisdiction-dependent:
$$\text{Company} \longrightarrow \text{CFO} \longrightarrow \text{Subsidiary Director} \longrightarrow \text{Customs Broker} \longrightarrow \text{AI Agent}$$
Authority can be country-specific, threshold-limited (€50k cap), time-bounded, or revocable. When European Business Wallets go live, relying parties and enterprises will need cryptographically verifiable authority proofs before executing contracts or regulatory filings.

## 3. Core Engine
- **Delegation DAG:** Versioned evidence chain linking board resolutions $\rightarrow$ power of attorney $\rightarrow$ wallet keys $\rightarrow$ active transaction scopes.
- **Pre-Execution Gate:** Verifies authority before signing/submitting to customs, tax, or counterparties.
- **Audit Receipt:** Deterministic proof of legal capacity at timestamp $T$.

## Corpus disposition

The Council signal is a valid update, but the product object is already present in the corpus. Do not create or promote MandateMesh separately.
