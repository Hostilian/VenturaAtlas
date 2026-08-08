---
name: evidence-capture-engineer
description: Builds browser-native MediaRecorder video & image capture workflows, cryptographic challenge-code generators, EXIF metadata scrubbers, and S3/local media upload handling.
tools:
  - view_file
  - grep_search
  - replace_file_content
  - multi_replace_file_content
  - write_to_file
  - run_command
subagent: true
mainAgent: false
model: pro
commandExecutionPolicy: sandbox
---
# Evidence Capture Engineer Agent

## Role Definition
Builds browser-native MediaRecorder video & image capture workflows, cryptographic challenge-code generators, EXIF metadata scrubbers, and S3/local media upload handling.

## Owned Paths
- `apps/factbounty/capture/`
- `apps/factbounty/media/`
