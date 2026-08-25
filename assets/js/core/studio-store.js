/**
 * Venture Atlas OS — Decision Studio Core Store (v3.0.0)
 * Offline-first, reactive, structured collaborative decision management engine.
 *
 * Supports:
 * - Persistent Workspaces & Multi-User identity
 * - Shortlists with 7 Kanban stages
 * - Structured Idea Notes (Pro, Con, Question, Risk, Assumption, Experiment, Research needed)
 * - 10-Dimension Multi-Criteria Scorecards with team aggregation & disagreement metrics
 * - Pairwise Matchup Tournaments with Elo/Leaderboard matrix
 * - Idea Variants Lab with branch lineage tracking (Idea -> Variant A -> Variant B)
 * - Finalist synthesis & Provisional Winner Decision record
 * - Validation Experiments & Falsification loop
 * - Full JSON Decision Packet Export / Import
 * - Schema v3.0.0 auto-migration from legacy session data
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VAStudio = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SCHEMA_VERSION = '3.0.0';
  const STORAGE_KEY_CURRENT = 'va_workspace_v3';
  const STORAGE_KEY_WORKSPACES = 'va_workspaces_index_v3';
  const STORAGE_KEY_USER = 'va_user_profile_v3';
  const STORAGE_KEY_FAVS = 'va-favs';

  const STAGES = [
    { id: 'inbox', label: 'Inbox', color: 'var(--muted)' },
    { id: 'interesting', label: 'Interesting', color: 'hsl(215, 80%, 55%)' },
    { id: 'researching', label: 'Researching', color: 'hsl(270, 70%, 60%)' },
    { id: 'finalist', label: 'Finalist', color: 'hsl(38, 95%, 50%)' },
    { id: 'testing', label: 'Testing & Validation', color: 'hsl(180, 80%, 45%)' },
    { id: 'winner', label: 'Provisional Winner', color: 'hsl(145, 75%, 45%)' },
    { id: 'parked', label: 'Parked / Rejected', color: 'hsl(0, 70%, 55%)' }
  ];

  const NOTE_TYPES = [
    { id: 'general', label: 'General Note', icon: '📝' },
    { id: 'pro', label: 'Strength / Pro', icon: '✅' },
    { id: 'con', label: 'Concern / Con', icon: '⚠️' },
    { id: 'question', label: 'Open Question', icon: '❓' },
    { id: 'assumption', label: 'Key Assumption', icon: '🎯' },
    { id: 'insight', label: 'Market Insight', icon: '💡' },
    { id: 'experiment', label: 'Validation Test', icon: '🧪' },
    { id: 'research_needed', label: 'Research Needed', icon: '🔍' }
  ];

  const SCORE_DIMENSIONS = [
    { id: 'painSeverity', label: 'Pain Severity & Urgency', weight: 1.0, desc: 'How acute, frequent, and costly is the buyer problem?' },
    { id: 'willingnessToPay', label: 'Willingness to Pay (WTP)', weight: 1.0, desc: 'Evidence of existing budget and price tolerance.' },
    { id: 'distributionAccess', label: 'Distribution Accessibility', weight: 1.0, desc: 'Can we reach customers organically or through scalable wedges?' },
    { id: 'founderFit', label: 'Founder & Team Fit', weight: 1.0, desc: 'Do we possess unfair domain insight, speed, or interest?' },
    { id: 'speedToRevenue', label: 'Speed to MVP & Revenue', weight: 1.0, desc: 'Time to launch first testable offer and collect cash.' },
    { id: 'validationCost', label: 'Validation Capital Efficiency', weight: 1.0, desc: 'Can this idea be tested cheaply before large builds?' },
    { id: 'differentiation', label: 'Competitive Differentiation', weight: 1.0, desc: 'Clarity of the value proposition against incumbents.' },
    { id: 'defensibility', label: 'Moat & Retention Potential', weight: 1.0, desc: 'Data network effects, switching costs, or workflow lock-in.' },
    { id: 'regulatoryFriction', label: 'Regulatory Tailwind / Risk', weight: 1.0, desc: 'Legal friction or compliance catalysts.' },
    { id: 'aiLeverage', label: 'AI Leverage & Cost Advantage', weight: 1.0, desc: 'Does AI enable 10x lower delivery cost or new capability?' }
  ];

  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  }

  function getRandomColor() {
    const hues = [210, 160, 270, 30, 340, 190, 80];
    const hue = hues[Math.floor(Math.random() * hues.length)];
    return `hsl(${hue}, 70%, 55%)`;
  }

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function validateMercuryBoundary(value) {
    if (value === null) return [];
    let validator = globalThis.VAMercury?.validateMercuryWorkspace;
    if (!validator && typeof require === 'function') {
      try { validator = require('./mercury-store').validateMercuryWorkspace; } catch (_) {}
    }
    if (typeof validator !== 'function') return null;
    return validator(value);
  }

  // Safe storage adapter
  const storage = {
    get(key, fallback = null) {
      if (typeof localStorage === 'undefined') return fallback;
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (e) {
        console.warn(`[StudioStore] Read error for ${key}:`, e);
        return fallback;
      }
    },
    set(key, val) {
      if (typeof localStorage === 'undefined') return true;
      try {
        localStorage.setItem(key, JSON.stringify(val));
        return true;
      } catch (e) {
        console.warn(`[StudioStore] Write error for ${key}:`, e);
        return false;
      }
    },
    remove(key) {
      if (typeof localStorage === 'undefined') return true;
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.warn(`[StudioStore] Remove error for ${key}:`, e);
        return false;
      }
    }
  };

  class StudioStore {
    constructor() {
      this.subscribers = new Set();
      this.user = this._initUser();
      this.workspace = null;
      this.load();
    }

    _initUser() {
      let u = storage.get(STORAGE_KEY_USER, null);
      if (!u || !u.uid) {
        u = {
          uid: generateId('usr'),
          displayName: 'Local user',
          color: getRandomColor()
        };
        storage.set(STORAGE_KEY_USER, u);
      }
      return u;
    }

    getUser() {
      return { ...this.user };
    }

    setUser(updates) {
      if (!updates || typeof updates !== 'object') return;
      this.user = {
        ...this.user,
        displayName: updates.displayName?.trim() || this.user.displayName,
        color: updates.color || this.user.color
      };
      storage.set(STORAGE_KEY_USER, this.user);
      
      // Update in active workspace members
      if (this.workspace) {
        const existingIdx = this.workspace.members.findIndex(m => m.uid === this.user.uid);
        if (existingIdx >= 0) {
          this.workspace.members[existingIdx].displayName = this.user.displayName;
          this.workspace.members[existingIdx].color = this.user.color;
        } else {
          this.workspace.members.push({
            uid: this.user.uid,
            displayName: this.user.displayName,
            role: this.workspace.ownerUid === this.user.uid ? 'owner' : 'member',
            joinedAt: new Date().toISOString(),
            color: this.user.color
          });
        }
        this.save();
      }
      this.emit('userChanged', this.user);
    }

    load() {
      let ws = storage.get(STORAGE_KEY_CURRENT, null);
      if (!ws) {
        ws = this._migrateOrInit();
      }
      this.workspace = this._normalizeWorkspace(ws);
      this.save(false);
    }

    _migrateOrInit() {
      // Check legacy session
      const legacySession = storage.get('va-room-session', null);
      const legacyFavs = storage.get(STORAGE_KEY_FAVS, []);
      const legacyShortlist = storage.get('va-room-shortlist', []);

      const newId = legacySession?.id || generateId('ws');
      const name = legacySession?.name || 'My Decision Workspace';
      const initialIdeas = Array.from(new Set([
        ...(legacySession?.shortlist || []),
        ...legacyShortlist,
        ...legacyFavs
      ])).slice(0, 8);

      const defaultShortlist = initialIdeas.map((id, idx) => ({
        ideaId: id,
        stage: idx < 2 ? 'interesting' : 'inbox',
        tags: [],
        addedBy: this.user.displayName,
        addedAt: new Date().toISOString(),
        rankOrder: idx
      }));

      const legacyComments = (legacySession?.comments || []).map(c => ({
        id: generateId('note'),
        ideaId: initialIdeas[0] || 'idea-061',
        authorUid: this.user.uid,
        authorName: c.user || 'Founder',
        type: 'general',
        content: c.text || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isShared: true
      }));

      const legacyVotes = legacySession?.votes || {};

      return {
        schemaVersion: SCHEMA_VERSION,
        id: newId,
        name: name,
        ownerUid: this.user.uid,
        ownerName: this.user.displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        votingMode: legacySession?.votingMode || 'scorecard',
        resultsVisibility: legacySession?.resultsVisibility || 'always',
        members: [{
          uid: this.user.uid,
          displayName: this.user.displayName,
          role: 'owner',
          joinedAt: new Date().toISOString(),
          color: this.user.color
        }],
        shortlist: defaultShortlist,
        notes: legacyComments,
        scorecards: [],
        pairwise: [],
        reactionVotes: legacyVotes,
        variants: [],
        decision: null,
        experiments: [],
        mercury: null,
        activity: [{
          id: generateId('act'),
          timestamp: new Date().toISOString(),
          actorName: 'System',
          action: 'WORKSPACE_CREATED',
          details: `Workspace "${name}" initialized`
        }]
      };
    }

    _normalizeWorkspace(raw) {
      if (!raw || typeof raw !== 'object') return this._migrateOrInit();
      const rawMercury = raw.mercury && typeof raw.mercury === 'object' ? raw.mercury : null;
      const mercuryErrors = rawMercury ? validateMercuryBoundary(rawMercury) : [];

      const ws = {
        schemaVersion: SCHEMA_VERSION,
        id: String(raw.id || generateId('ws')),
        name: String(raw.name || 'Decision Workspace'),
        ownerUid: String(raw.ownerUid || this.user.uid),
        ownerName: String(raw.ownerName || this.user.displayName),
        createdAt: raw.createdAt || new Date().toISOString(),
        updatedAt: raw.updatedAt || new Date().toISOString(),
        votingMode: raw.votingMode || 'scorecard',
        resultsVisibility: raw.resultsVisibility || 'always',
        members: Array.isArray(raw.members) ? raw.members : [],
        shortlist: Array.isArray(raw.shortlist) ? raw.shortlist.map((item, idx) => {
          if (typeof item === 'string') {
            return {
              ideaId: item,
              stage: 'inbox',
              tags: [],
              addedBy: this.user.displayName,
              addedAt: new Date().toISOString(),
              rankOrder: idx
            };
          }
          return {
            ideaId: String(item.ideaId || ''),
            stage: STAGES.some(s => s.id === item.stage) ? item.stage : 'inbox',
            tags: Array.isArray(item.tags) ? item.tags : [],
            addedBy: String(item.addedBy || this.user.displayName),
            addedAt: item.addedAt || new Date().toISOString(),
            rankOrder: typeof item.rankOrder === 'number' ? item.rankOrder : idx
          };
        }).filter(item => Boolean(item.ideaId)) : [],
        notes: Array.isArray(raw.notes) ? raw.notes : [],
        scorecards: Array.isArray(raw.scorecards) ? raw.scorecards : [],
        pairwise: Array.isArray(raw.pairwise) ? raw.pairwise : [],
        reactionVotes: raw.reactionVotes && typeof raw.reactionVotes === 'object' ? raw.reactionVotes : {},
        variants: Array.isArray(raw.variants) ? raw.variants : [],
        decision: raw.decision && typeof raw.decision === 'object' ? raw.decision : null,
        experiments: Array.isArray(raw.experiments) ? raw.experiments : [],
        mercury: rawMercury && (mercuryErrors === null || mercuryErrors.length === 0) ? rawMercury : null,
        activity: Array.isArray(raw.activity) ? raw.activity : []
      };

      // Ensure current user is in members list
      if (!ws.members.some(m => m.uid === this.user.uid)) {
        ws.members.push({
          uid: this.user.uid,
          displayName: this.user.displayName,
          role: ws.ownerUid === this.user.uid ? 'owner' : 'member',
          joinedAt: new Date().toISOString(),
          color: this.user.color
        });
      }

      return ws;
    }

    save(emitEvent = true) {
      if (!this.workspace) return;
      this.workspace.updatedAt = new Date().toISOString();
      const currentSaved = storage.set(STORAGE_KEY_CURRENT, this.workspace);

      // Keep workspaces index updated
      let index = storage.get(STORAGE_KEY_WORKSPACES, []);
      const existing = index.findIndex(w => w.id === this.workspace.id);
      const summary = {
        id: this.workspace.id,
        name: this.workspace.name,
        updatedAt: this.workspace.updatedAt,
        itemCount: this.workspace.shortlist.length
      };
      if (existing >= 0) {
        index[existing] = summary;
      } else {
        index.unshift(summary);
      }
      const indexSaved = storage.set(STORAGE_KEY_WORKSPACES, index);

      // Sync shortlist IDs to va-favs for backwards compatibility
      const shortlistIds = this.workspace.shortlist.map(s => s.ideaId);
      const favoritesSaved = storage.set(STORAGE_KEY_FAVS, shortlistIds);

      const persisted = currentSaved && indexSaved && favoritesSaved;
      if (emitEvent && persisted) {
        this.emit('stateChanged', this.workspace);
      }
      return persisted;
    }

    getWorkspace() {
      return this.workspace ? JSON.parse(JSON.stringify(this.workspace)) : null;
    }

    setWorkspace(newWs, emitEvent = true) {
      this.workspace = this._normalizeWorkspace(newWs);
      this.save(emitEvent);
    }

    createWorkspace(name = 'New Workspace', initialIds = []) {
      const newId = generateId('ws');
      const ws = {
        schemaVersion: SCHEMA_VERSION,
        id: newId,
        name: name.trim() || 'New Workspace',
        ownerUid: this.user.uid,
        ownerName: this.user.displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        votingMode: 'scorecard',
        resultsVisibility: 'always',
        members: [{
          uid: this.user.uid,
          displayName: this.user.displayName,
          role: 'owner',
          joinedAt: new Date().toISOString(),
          color: this.user.color
        }],
        shortlist: initialIds.map((id, idx) => ({
          ideaId: id,
          stage: 'inbox',
          tags: [],
          addedBy: this.user.displayName,
          addedAt: new Date().toISOString(),
          rankOrder: idx
        })),
        notes: [],
        scorecards: [],
        pairwise: [],
        reactionVotes: {},
        variants: [],
        decision: null,
        experiments: [],
        activity: [{
          id: generateId('act'),
          timestamp: new Date().toISOString(),
          actorName: this.user.displayName,
          action: 'WORKSPACE_CREATED',
          details: `Created workspace "${name}"`
        }]
      };
      this.workspace = ws;
      this.save();
      return ws;
    }

    listWorkspaces() {
      return storage.get(STORAGE_KEY_WORKSPACES, []);
    }

    /* ================================================================
       SHORTLIST & STAGES
       ================================================================ */
    getShortlist() {
      return this.workspace?.shortlist || [];
    }

    isInShortlist(ideaId) {
      if (!this.workspace || !ideaId) return false;
      return this.workspace.shortlist.some(item => item.ideaId === ideaId);
    }

    addToShortlist(ideaId, stage = 'inbox', tags = []) {
      if (!this.workspace || !ideaId) return false;
      if (this.isInShortlist(ideaId)) return true;

      const newItem = {
        ideaId,
        stage: STAGES.some(s => s.id === stage) ? stage : 'inbox',
        tags: Array.isArray(tags) ? tags : [],
        addedBy: this.user.displayName,
        addedAt: new Date().toISOString(),
        rankOrder: this.workspace.shortlist.length
      };

      this.workspace.shortlist.push(newItem);
      this.logActivity('SHORTLIST_ADDED', `Added ${ideaId} to ${stage}`);
      this.save();
      this.emit('shortlistChanged', this.workspace.shortlist);
      return true;
    }

    removeFromShortlist(ideaId) {
      if (!this.workspace || !ideaId) return false;
      const initialLen = this.workspace.shortlist.length;
      this.workspace.shortlist = this.workspace.shortlist.filter(item => item.ideaId !== ideaId);
      if (this.workspace.shortlist.length !== initialLen) {
        this.logActivity('SHORTLIST_REMOVED', `Removed ${ideaId} from shortlist`);
        this.save();
        this.emit('shortlistChanged', this.workspace.shortlist);
        return true;
      }
      return false;
    }

    setShortlistStage(ideaId, newStage) {
      if (!this.workspace || !ideaId || !STAGES.some(s => s.id === newStage)) return false;
      const item = this.workspace.shortlist.find(i => i.ideaId === ideaId);
      if (item && item.stage !== newStage) {
        const oldStage = item.stage;
        item.stage = newStage;
        this.logActivity('STAGE_CHANGED', `Moved ${ideaId} from ${oldStage} to ${newStage}`);
        this.save();
        this.emit('shortlistChanged', this.workspace.shortlist);
        return true;
      }
      return false;
    }

    reorderShortlist(orderedIdeaIds) {
      if (!this.workspace || !Array.isArray(orderedIdeaIds)) return;
      const itemMap = new Map(this.workspace.shortlist.map(i => [i.ideaId, i]));
      const newShortlist = [];
      orderedIdeaIds.forEach((id, idx) => {
        if (itemMap.has(id)) {
          const item = itemMap.get(id);
          item.rankOrder = idx;
          newShortlist.push(item);
          itemMap.delete(id);
        }
      });
      // Append any remaining
      itemMap.forEach(item => {
        item.rankOrder = newShortlist.length;
        newShortlist.push(item);
      });
      this.workspace.shortlist = newShortlist;
      this.save();
    }

    /* ================================================================
       STRUCTURED NOTES
       ================================================================ */
    getNotes(ideaId = null) {
      if (!this.workspace) return [];
      if (!ideaId) return this.workspace.notes || [];
      return (this.workspace.notes || []).filter(n => n.ideaId === ideaId);
    }

    addNote({ ideaId, type = 'general', content, isShared = true }) {
      if (!this.workspace || !ideaId || !content?.trim()) return null;
      const validTypes = NOTE_TYPES.map(t => t.id);
      const note = {
        id: generateId('note'),
        ideaId,
        authorUid: this.user.uid,
        authorName: this.user.displayName,
        type: validTypes.includes(type) ? type : 'general',
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isShared: Boolean(isShared)
      };
      this.workspace.notes.push(note);
      this.logActivity('NOTE_ADDED', `Added ${type} note on ${ideaId}`);
      this.save();
      this.emit('notesChanged', this.workspace.notes);
      return note;
    }

    updateNote(noteId, newContent) {
      if (!this.workspace || !noteId || !newContent?.trim()) return false;
      const note = this.workspace.notes.find(n => n.id === noteId);
      if (note) {
        note.content = newContent.trim();
        note.updatedAt = new Date().toISOString();
        this.save();
        this.emit('notesChanged', this.workspace.notes);
        return true;
      }
      return false;
    }

    deleteNote(noteId) {
      if (!this.workspace || !noteId) return false;
      const len = this.workspace.notes.length;
      this.workspace.notes = this.workspace.notes.filter(n => n.id !== noteId);
      if (this.workspace.notes.length !== len) {
        this.save();
        this.emit('notesChanged', this.workspace.notes);
        return true;
      }
      return false;
    }

    /* ================================================================
       MULTI-CRITERIA SCORECARDS
       ================================================================ */
    getScorecard(ideaId, uid = null) {
      if (!this.workspace || !ideaId) return null;
      const targetUid = uid || this.user.uid;
      return (this.workspace.scorecards || []).find(s => s.ideaId === ideaId && s.uid === targetUid) || null;
    }

    getAllScorecards(ideaId) {
      if (!this.workspace || !ideaId) return [];
      return (this.workspace.scorecards || []).filter(s => s.ideaId === ideaId);
    }

    saveScorecard({ ideaId, scores, dimensionNotes = {} }) {
      if (!this.workspace || !ideaId || !scores || typeof scores !== 'object') return null;
      
      const cleanScores = {};
      SCORE_DIMENSIONS.forEach(dim => {
        const val = Number(scores[dim.id]);
        if (Number.isFinite(val) && val >= 1 && val <= 10) {
          cleanScores[dim.id] = Math.round(val * 10) / 10;
        }
      });

      const existingIdx = (this.workspace.scorecards || []).findIndex(
        s => s.ideaId === ideaId && s.uid === this.user.uid
      );

      const scorecard = {
        id: `scorecard_${ideaId}_${this.user.uid}`,
        ideaId,
        uid: this.user.uid,
        voterName: this.user.displayName,
        scores: cleanScores,
        dimensionNotes: typeof dimensionNotes === 'object' ? dimensionNotes : {},
        updatedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        this.workspace.scorecards[existingIdx] = scorecard;
      } else {
        this.workspace.scorecards.push(scorecard);
      }

      this.logActivity('SCORECARD_SAVED', `Updated scorecard for ${ideaId}`);
      this.save();
      this.emit('scorecardsChanged', this.workspace.scorecards);
      return scorecard;
    }

    getScorecardAggregation(ideaId) {
      const scorecards = this.getAllScorecards(ideaId);
      if (!scorecards.length) return null;

      const dimAverages = {};
      const dimDisagreements = {};
      let totalWeightedScore = 0;
      let totalWeight = 0;

      SCORE_DIMENSIONS.forEach(dim => {
        const values = scorecards
          .map(s => s.scores?.[dim.id])
          .filter(v => typeof v === 'number' && Number.isFinite(v));

        if (values.length > 0) {
          const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
          dimAverages[dim.id] = Math.round(avg * 10) / 10;
          totalWeightedScore += avg * dim.weight;
          totalWeight += dim.weight;

          // Compute standard deviation for disagreement
          if (values.length > 1) {
            const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
            dimDisagreements[dim.id] = Math.round(Math.sqrt(variance) * 10) / 10;
          } else {
            dimDisagreements[dim.id] = 0;
          }
        } else {
          dimAverages[dim.id] = null;
          dimDisagreements[dim.id] = null;
        }
      });

      const compositeScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 10) / 10 : null;
      const overallScore100 = compositeScore !== null ? Math.round(compositeScore * 10) : null;

      // Disagreement index (average std dev across dimensions)
      const validStdDevs = Object.values(dimDisagreements).filter(v => typeof v === 'number');
      const disagreementIndex = validStdDevs.length > 0
        ? Math.round((validStdDevs.reduce((a, b) => a + b, 0) / validStdDevs.length) * 10) / 10
        : 0;

      return {
        ideaId,
        scorecardCount: scorecards.length,
        dimAverages,
        dimDisagreements,
        compositeScore,
        overallScore100,
        disagreementIndex,
        hasDisagreement: disagreementIndex >= 1.0 || Object.values(dimDisagreements).some(d => typeof d === 'number' && d >= 1.5)
      };
    }

    /* ================================================================
       PAIRWISE COMPARISON TOURNAMENTS
       ================================================================ */
    getPairwiseVotes() {
      return this.workspace?.pairwise || [];
    }

    savePairwiseVote({ ideaA, ideaB, winnerId, rationale = '' }) {
      if (!this.workspace || !ideaA || !ideaB || !winnerId) return null;
      const pairId = `pair_${[ideaA, ideaB].sort().join('_')}_${this.user.uid}`;
      const record = {
        id: pairId,
        ideaA,
        ideaB,
        winnerId, // ideaA, ideaB, 'tie', or 'pass'
        uid: this.user.uid,
        voterName: this.user.displayName,
        rationale: rationale.trim(),
        timestamp: new Date().toISOString()
      };

      const existingIdx = this.workspace.pairwise.findIndex(p => p.id === pairId);
      if (existingIdx >= 0) {
        this.workspace.pairwise[existingIdx] = record;
      } else {
        this.workspace.pairwise.push(record);
      }

      this.logActivity('PAIRWISE_VOTE', `Pairwise vote: ${ideaA} vs ${ideaB} (Winner: ${winnerId})`);
      this.save();
      this.emit('pairwiseChanged', this.workspace.pairwise);
      return record;
    }

    getPairwiseLeaderboard() {
      if (!this.workspace) return [];
      const shortlistIds = this.workspace.shortlist.map(s => s.ideaId);
      const stats = {};
      shortlistIds.forEach(id => {
        stats[id] = { ideaId: id, wins: 0, losses: 0, ties: 0, totalMatches: 0, winRate: 0 };
      });

      (this.workspace.pairwise || []).forEach(vote => {
        const a = vote.ideaA;
        const b = vote.ideaB;
        if (!stats[a]) stats[a] = { ideaId: a, wins: 0, losses: 0, ties: 0, totalMatches: 0, winRate: 0 };
        if (!stats[b]) stats[b] = { ideaId: b, wins: 0, losses: 0, ties: 0, totalMatches: 0, winRate: 0 };

        if (vote.winnerId === a) {
          stats[a].wins += 1;
          stats[b].losses += 1;
        } else if (vote.winnerId === b) {
          stats[b].wins += 1;
          stats[a].losses += 1;
        } else if (vote.winnerId === 'tie') {
          stats[a].ties += 1;
          stats[b].ties += 1;
        }
        stats[a].totalMatches += 1;
        stats[b].totalMatches += 1;
      });

      return Object.values(stats)
        .map(s => ({
          ...s,
          winRate: s.totalMatches > 0 ? Math.round(((s.wins + 0.5 * s.ties) / s.totalMatches) * 100) : 0
        }))
        .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);
    }

    /* ================================================================
       REACTION VOTING (Lightweight Quick Vote)
       ================================================================ */
    saveReaction(ideaId, reaction) {
      if (!this.workspace || !ideaId) return;
      if (!this.workspace.reactionVotes) this.workspace.reactionVotes = {};
      this.workspace.reactionVotes[ideaId] = reaction; // 'interested' | 'unsure' | 'pass'
      this.logActivity('REACTION_VOTE', `Voted ${reaction} on ${ideaId}`);
      this.save();
    }

    getReaction(ideaId) {
      return this.workspace?.reactionVotes?.[ideaId] || null;
    }

    /* ================================================================
       IDEA VARIANTS & ITERATIONS LAB
       ================================================================ */
    getVariants(parentIdeaId = null) {
      if (!this.workspace) return [];
      const list = this.workspace.variants || [];
      if (!parentIdeaId) return list;
      return list.filter(v => v.parentIdeaId === parentIdeaId);
    }

    getVariant(variantId) {
      return (this.workspace?.variants || []).find(v => v.id === variantId) || null;
    }

    createVariant({ parentIdeaId, parentVariantId = null, title, changes = {}, stage = 'inbox' }) {
      if (!this.workspace || !parentIdeaId || !title?.trim()) return null;
      const variant = {
        id: generateId(`var_${parentIdeaId}`),
        parentIdeaId,
        parentVariantId: parentVariantId || null,
        title: title.trim(),
        creatorUid: this.user.uid,
        creatorName: this.user.displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        changes: {
          targetCustomer: changes.targetCustomer?.trim() || '',
          wedge: changes.wedge?.trim() || '',
          pricingModel: changes.pricingModel?.trim() || '',
          distribution: changes.distribution?.trim() || '',
          techScope: changes.techScope?.trim() || '',
          regulatoryStrategy: changes.regulatoryStrategy?.trim() || '',
          summary: changes.summary?.trim() || ''
        },
        stage: STAGES.some(s => s.id === stage) ? stage : 'inbox'
      };

      this.workspace.variants.push(variant);
      // Also add variant to shortlist
      this.addToShortlist(variant.id, stage);
      this.logActivity('VARIANT_CREATED', `Created variant "${title}" for ${parentIdeaId}`);
      this.save();
      this.emit('variantsChanged', this.workspace.variants);
      return variant;
    }

    updateVariant(variantId, updates) {
      if (!this.workspace || !variantId || !updates) return false;
      const v = this.workspace.variants.find(item => item.id === variantId);
      if (v) {
        if (updates.title) v.title = updates.title.trim();
        if (updates.changes && typeof updates.changes === 'object') {
          v.changes = { ...v.changes, ...updates.changes };
        }
        if (updates.stage && STAGES.some(s => s.id === updates.stage)) {
          v.stage = updates.stage;
          this.setShortlistStage(variantId, updates.stage);
        }
        v.updatedAt = new Date().toISOString();
        this.save();
        this.emit('variantsChanged', this.workspace.variants);
        return true;
      }
      return false;
    }

    deleteVariant(variantId) {
      if (!this.workspace || !variantId) return false;
      const len = this.workspace.variants.length;
      this.workspace.variants = this.workspace.variants.filter(v => v.id !== variantId);
      if (this.workspace.variants.length !== len) {
        this.removeFromShortlist(variantId);
        this.save();
        this.emit('variantsChanged', this.workspace.variants);
        return true;
      }
      return false;
    }

    /* ================================================================
       PROVISIONAL WINNER & DECISION LOG
       ================================================================ */
    recordDecision({
      selectedId,
      selectedTitle,
      isVariant = false,
      rationale,
      decisiveAssumptions = [],
      dissentObjections = [],
      confidenceLevel = 'medium',
      nextExperiment = '',
      reconsiderationTriggers = []
    }) {
      if (!this.workspace || !selectedId || !rationale?.trim()) return null;

      const decision = {
        id: generateId('dec'),
        selectedId,
        selectedTitle: selectedTitle || selectedId,
        isVariant: Boolean(isVariant),
        decidedAt: new Date().toISOString(),
        participants: this.workspace.members.map(m => m.displayName),
        rationale: rationale.trim(),
        decisiveAssumptions: Array.isArray(decisiveAssumptions) ? decisiveAssumptions.filter(Boolean) : [],
        dissentObjections: Array.isArray(dissentObjections) ? dissentObjections.filter(Boolean) : [],
        confidenceLevel: ['high', 'medium', 'low'].includes(confidenceLevel) ? confidenceLevel : 'medium',
        nextExperiment: nextExperiment.trim(),
        reconsiderationTriggers: Array.isArray(reconsiderationTriggers) ? reconsiderationTriggers.filter(Boolean) : []
      };

      this.workspace.decision = decision;
      this.setShortlistStage(selectedId, 'winner');
      this.logActivity('DECISION_RECORDED', `Provisional winner selected: ${selectedTitle || selectedId}`);
      this.save();
      this.emit('decisionChanged', decision);
      return decision;
    }

    getDecision() {
      return this.workspace?.decision || null;
    }

    reopenDecision(reason = '') {
      if (!this.workspace || !this.workspace.decision) return false;
      const prevWinnerId = this.workspace.decision.selectedId;
      this.logActivity('DECISION_REOPENED', `Reopened decision for ${prevWinnerId}: ${reason || 'Reconsidered'}`);
      this.workspace.decision = null;
      if (prevWinnerId) {
        this.setShortlistStage(prevWinnerId, 'finalist');
      }
      this.save();
      this.emit('decisionChanged', null);
      return true;
    }

    /* ================================================================
       VALIDATION EXPERIMENTS
       ================================================================ */
    getExperiments(ideaId = null) {
      if (!this.workspace) return [];
      const list = this.workspace.experiments || [];
      if (!ideaId) return list;
      return list.filter(e => e.ideaId === ideaId);
    }

    addExperiment({
      ideaId,
      hypothesis,
      testDesign,
      targetMetric = '',
      costBudget = '€0 / 10 hours',
      status = 'planned'
    }) {
      if (!this.workspace || !ideaId || !hypothesis?.trim()) return null;
      const experiment = {
        id: generateId('exp'),
        ideaId,
        hypothesis: hypothesis.trim(),
        testDesign: testDesign?.trim() || '',
        targetMetric: targetMetric.trim(),
        costBudget: costBudget.trim(),
        status: ['planned', 'running', 'passed', 'failed', 'inconclusive'].includes(status) ? status : 'planned',
        outcomeSummary: '',
        decisionImpact: 'continue',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.workspace.experiments.push(experiment);
      this.logActivity('EXPERIMENT_CREATED', `Experiment planned for ${ideaId}: ${hypothesis.slice(0, 40)}...`);
      this.save();
      this.emit('experimentsChanged', this.workspace.experiments);
      return experiment;
    }

    updateExperiment(expId, updates) {
      if (!this.workspace || !expId || !updates) return false;
      const exp = this.workspace.experiments.find(e => e.id === expId);
      if (exp) {
        if (updates.status) exp.status = updates.status;
        if (updates.outcomeSummary !== undefined) exp.outcomeSummary = updates.outcomeSummary.trim();
        if (updates.decisionImpact) exp.decisionImpact = updates.decisionImpact;
        if (updates.hypothesis) exp.hypothesis = updates.hypothesis.trim();
        if (updates.testDesign) exp.testDesign = updates.testDesign.trim();
        if (updates.targetMetric) exp.targetMetric = updates.targetMetric.trim();
        if (updates.costBudget) exp.costBudget = updates.costBudget.trim();
        exp.updatedAt = new Date().toISOString();
        this.logActivity('EXPERIMENT_UPDATED', `Experiment ${expId} status: ${exp.status}`);
        this.save();
        this.emit('experimentsChanged', this.workspace.experiments);
        return true;
      }
      return false;
    }

    /* ================================================================
       MERCURY COMMERCIAL REALITY ADAPTER
       ================================================================ */
    getMercuryWorkspace() {
      return this.workspace?.mercury
        ? JSON.parse(JSON.stringify(this.workspace.mercury))
        : null;
    }

    setMercuryWorkspace(mercuryWorkspace) {
      if (!this.workspace) return false;
      if (mercuryWorkspace !== null && (!mercuryWorkspace || typeof mercuryWorkspace !== 'object')) {
        return false;
      }
      if (mercuryWorkspace !== null) {
        const mercuryErrors = validateMercuryBoundary(mercuryWorkspace);
        if (mercuryErrors === null || mercuryErrors.length) return false;
      }
      const previous = this.workspace.mercury ? JSON.parse(JSON.stringify(this.workspace.mercury)) : null;
      this.workspace.mercury = mercuryWorkspace
        ? JSON.parse(JSON.stringify(mercuryWorkspace))
        : null;
      if (!this.save()) {
        this.workspace.mercury = previous;
        return false;
      }
      this.emit('mercuryChanged', this.workspace.mercury);
      return true;
    }

    /* ================================================================
       ACTIVITY LOGGING
       ================================================================ */
    logActivity(action, details = '') {
      if (!this.workspace) return;
      const act = {
        id: generateId('act'),
        timestamp: new Date().toISOString(),
        actorName: this.user.displayName,
        action,
        details: String(details)
      };
      if (!Array.isArray(this.workspace.activity)) this.workspace.activity = [];
      this.workspace.activity.unshift(act);
      if (this.workspace.activity.length > 100) {
        this.workspace.activity = this.workspace.activity.slice(0, 100);
      }
    }

    getActivity(limit = 20) {
      return (this.workspace?.activity || []).slice(0, limit);
    }

    /* ================================================================
       EXPORT / IMPORT DECISION PACKET
       ================================================================ */
    exportDecisionPacket() {
      if (!this.workspace) return null;
      const packet = {
        schemaVersion: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        generator: 'VenturaAtlas OS Decision Studio v3.0.0',
        workspace: this.getWorkspace()
      };
      return JSON.stringify(packet, null, 2);
    }

    importDecisionPacket(rawInput) {
      try {
        const parsed = typeof rawInput === 'string' ? JSON.parse(rawInput) : rawInput;
        if (!parsed || typeof parsed !== 'object') {
          return { success: false, error: 'Malformed JSON input' };
        }

        const ws = parsed.workspace || parsed;
        if (!ws.id || !ws.name) {
          return { success: false, error: 'Invalid Decision Packet: missing workspace id or name' };
        }
        if (ws.mercury) {
          const mercuryErrors = validateMercuryBoundary(ws.mercury);
          if (mercuryErrors === null) return { success: false, error: 'Mercury validator is unavailable' };
          if (mercuryErrors.length) return { success: false, error: `Invalid Mercury workspace: ${mercuryErrors.join('; ')}` };
        }

        this.workspace = this._normalizeWorkspace(ws);
        this.logActivity('WORKSPACE_IMPORTED', `Imported decision packet "${ws.name}"`);
        if (!this.save()) return { success: false, error: 'Decision Packet could not be persisted locally' };
        this.emit('stateChanged', this.workspace);
        return { success: true, workspace: this.getWorkspace() };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    /* ================================================================
       EVENT SUBSCRIPTIONS
       ================================================================ */
    subscribe(callback) {
      if (typeof callback === 'function') {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
      }
      return () => {};
    }

    emit(event, data) {
      this.subscribers.forEach(cb => {
        try {
          cb(event, data);
        } catch (err) {
          console.warn('[StudioStore] Subscriber error:', err);
        }
      });

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        try {
          window.dispatchEvent(new CustomEvent('va:studio:' + event, { detail: data }));
        } catch (e) {}
      }
    }
  }

  // Singleton instance
  const instance = new StudioStore();

  return {
    StudioStore,
    store: instance,
    STAGES,
    NOTE_TYPES,
    SCORE_DIMENSIONS,
    esc
  };
}));
