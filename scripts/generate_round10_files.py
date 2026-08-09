import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ideas_file = os.path.join(ROOT, "data", "ideas.json")

with open(ideas_file, 'r', encoding='utf-8') as f:
    ideas_data = json.load(f)

ideas = [i for i in ideas_data['ideas'] if i['id'] in [f"idea-{n}" for n in range(385, 395)]]

for x in ideas:
    idea_id = x['id']
    slug = x['slug']
    name = x['name']
    concept = x.get('oneSentenceConcept', '')
    customer = x.get('atAGlance', {}).get('targetCustomer', x.get('targetCustomer', ''))
    problem = x.get('atAGlance', {}).get('problemSolved', x.get('problemSolved', ''))
    pitch = x.get('elevatorPitch', '')
    desc = x.get('detailedDescription', '')
    score = x.get('atAGlance', {}).get('overallScore', 80)
    cat = x.get('category', 'Technology')
    
    # 1. Generate dossier
    dossier_content = f"""# {name} Dossier

## Overview
{concept}

## Category
{cat}

## Overall Score
{score}/100

## Target Customer
{customer}

## Problem Solved
{problem}

## Elevator Pitch
{pitch}

## Detailed Description
{desc}
"""
    dossier_path = os.path.join(ROOT, "ideas", f"{slug}.md")
    with open(dossier_path, 'w', encoding='utf-8') as df:
        df.write(dossier_content)
        
    # 2. Generate 25 prompts
    prompts_dir = os.path.join(ROOT, "prompts", "idea-specific", idea_id)
    os.makedirs(prompts_dir, exist_ok=True)
    
    prompt_titles = [
        "Market Validation & ICP Definition", "Problem Statement & Friction Audit", "Competitive Advantage Analysis",
        "Regulatory & Compliance Framework", "Zero-Dollar MVP Architecture", "Customer Discovery Script",
        "Value Proposition Testing", "Technical Feasibility Analysis", "Pricing Strategy & Model",
        "Go-To-Market Channel Plan", "Content Strategy & SEO Keywords", "Outreach Cold Email Campaign",
        "Landing Page Copy & Conversion Structure", "Product Feature Prioritization Matrix", "Security & Data Privacy Audit",
        "Risk Mitigation & Contingency Plan", "Financial Model & Expense Breakdown", "Unit Economics & Margin Analysis",
        "Customer Onboarding Flow", "Product Roadmap (30-60-90 Day)", "Retention & Churn Reduction Plan",
        "API & Data Integration Architecture", "Enterprise SLA & Support Structure", "Partnership & Ecosystem Strategy",
        "Investor Pitch & Execution Summary"
    ]
    
    for p_idx in range(1, 26):
        title = prompt_titles[p_idx - 1]
        p_content = f"""# {idea_id} — Prompt {p_idx:02d}: {title}

**Target Idea:** {name} ({idea_id})  
**Category:** {cat}  

## Execution Instruction
You are an expert AI product strategist and lead engineer working on **{name}**.

### Mission Context
{concept}

### Detailed Execution Task
Execute deep research, strategy, and step-by-step implementation planning for **{title}**.
Focus specifically on {customer} and solving the core problem: "{problem}".

Deliver a complete, actionable, highly detailed output with concrete examples and no generic placeholders.
"""
        p_path = os.path.join(prompts_dir, f"prompt-{p_idx:02d}.md")
        with open(p_path, 'w', encoding='utf-8') as pf:
            pf.write(p_content)

print(f"Successfully generated dossiers and 25x prompt packs for ideas idea-385 through idea-394 ({len(ideas)} total ideas).")
