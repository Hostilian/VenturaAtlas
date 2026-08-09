# ProvenanceChaos / MarkCI — AI-Content Provenance Whole-Pipeline Chaos Harness Dossier

## Overview
Whole-pipeline automated chaos testing and QA harness verifying whether C2PA Content Credentials and invisible AI watermarks survive complex media transformation pipelines.

## Category
Developer tools & infrastructure

## Overall Score
94.3/100

## Target Customer
Media publishers, AI image/video SaaS platforms, broadcasters, and digital asset management (DAM) vendors

## Problem Solved
Provenance metadata silently stripped during image optimization, WebP/AVIF conversions, and mobile export steps, causing EU AI Act Article 50 non-compliance.

## Elevator Pitch
While individual tools comply with C2PA standards, real enterprise publishing pipelines (DAM → Photoshop → CMS → CDN → Mobile Transcoder → Social) frequently strip or corrupt provenance metadata. MarkCI injects synthetic AI assets into CI/CD pipelines to test every media transformation hop and detect provenance loss before publishing.

## Detailed Description
Discovered in Deep Research Round #10 (Score 9.43 / 10). EU AI Act Article 50 transparency obligations require machine-readable marking of generated media. MarkCI acts as chaos engineering for AI provenance, continuously testing image and video processing steps across C2PA, SynthID, and visible watermark preservation.
