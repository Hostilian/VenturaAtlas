/**
 * census-store.js
 * CENSUS data store — loads and indexes all CENSUS JSON data files.
 * Provides query API for populations, estimates, units, sources, lineage, and measurement questions.
 * Read-only. No writes. No network calls.
 */

'use strict';

const CENSUS_VERSION = '1.0.0';

/**
 * CensusStore
 * In-browser data store for CENSUS market measurement layer.
 * Loaded lazily on first access.
 */
class CensusStore {
  constructor() {
    this._loaded = false;
    this._units = [];
    this._populations = [];
    this._sources = [];
    this._estimates = [];
    this._lineages = [];
    this._questions = [];
    this._crosswalks = [];
    this._fmLinks = [];

    // Indexes
    this._unitIndex = new Map();
    this._populationIndex = new Map();
    this._sourceIndex = new Map();
    this._estimateIndex = new Map();
    this._lineageByDerivedId = new Map();
    this._questionIndex = new Map();
    this._fmLinkIndex = new Map();
  }

  /**
   * Load all CENSUS data from static JSON files.
   * @returns {Promise<void>}
   */
  async load() {
    if (this._loaded) return;

    const files = [
      { key: 'units',       path: '../data/census-statistical-units.json',      prop: 'units' },
      { key: 'populations', path: '../data/census-populations.json',             prop: 'populations' },
      { key: 'sources',     path: '../data/census-sources.json',                 prop: 'sources' },
      { key: 'estimates',   path: '../data/census-estimates.json',               prop: 'estimates' },
      { key: 'lineages',    path: '../data/census-estimate-lineage.json',        prop: 'lineages' },
      { key: 'questions',   path: '../data/census-measurement-questions.json',   prop: 'questions' },
      { key: 'crosswalks',  path: '../data/census-classification-crosswalks.json', prop: 'crosswalks' },
      { key: 'fmLinks',     path: '../data/census-financial-model-links.json',   prop: 'links' },
    ];

    const results = await Promise.all(
      files.map(f => fetch(f.path).then(r => r.json()).then(d => ({ key: f.key, data: d[f.prop] || [] })))
    );

    for (const { key, data } of results) {
      this['_' + key] = data;
    }

    this._buildIndexes();
    this._loaded = true;
  }

  _buildIndexes() {
    for (const u of this._units)       this._unitIndex.set(u.unitId, u);
    for (const p of this._populations) this._populationIndex.set(p.populationId, p);
    for (const s of this._sources)     this._sourceIndex.set(s.censusSourceId, s);
    for (const e of this._estimates)   this._estimateIndex.set(e.estimateId, e);
    for (const l of this._lineages)    this._lineageByDerivedId.set(l.derivedEstimateId, l);
    for (const q of this._questions)   this._questionIndex.set(q.questionId, q);
    for (const l of this._fmLinks)     this._fmLinkIndex.set(l.ideaId, l);
  }

  // --- Units ---
  getAllUnits() { return [...this._units]; }
  getUnit(unitId) { return this._unitIndex.get(unitId) || null; }

  // --- Populations ---
  getAllPopulations() { return [...this._populations]; }
  getPopulation(populationId) { return this._populationIndex.get(populationId) || null; }
  getPopulationsByFunnelLevel(level) {
    return this._populations.filter(p => p.funnelLevel === level);
  }

  // --- Sources ---
  getAllSources() { return [...this._sources]; }
  getSource(censusSourceId) { return this._sourceIndex.get(censusSourceId) || null; }

  // --- Estimates ---
  getAllEstimates() { return [...this._estimates]; }
  getEstimate(estimateId) { return this._estimateIndex.get(estimateId) || null; }
  getEstimatesByUnit(unitId) {
    return this._estimates.filter(e => e.unitId === unitId);
  }
  getEstimatesByPopulation(populationId) {
    return this._estimates.filter(e => e.populationId === populationId);
  }
  getEstimatesByValueState(state) {
    return this._estimates.filter(e => e.valueState === state);
  }

  // --- Lineage ---
  getLineageForEstimate(estimateId) {
    return this._lineageByDerivedId.get(estimateId) || null;
  }
  getUpstreamEstimates(estimateId) {
    const lineage = this.getLineageForEstimate(estimateId);
    if (!lineage) return [];
    return lineage.inputEstimateIds.map(id => this.getEstimate(id)).filter(Boolean);
  }
  /**
   * Get all downstream estimates that depend on a given estimate.
   * Used for staleness propagation.
   */
  getDownstreamEstimates(estimateId) {
    return this._lineages
      .filter(l => l.inputEstimateIds.includes(estimateId))
      .map(l => this.getEstimate(l.derivedEstimateId))
      .filter(Boolean);
  }

  // --- Measurement Questions ---
  getAllQuestions() { return [...this._questions]; }
  getQuestion(questionId) { return this._questionIndex.get(questionId) || null; }
  getOpenQuestions() { return this._questions.filter(q => q.status === 'OPEN'); }
  getQuestionsByIdea(ideaId) {
    return this._questions.filter(q => q.ideaId === ideaId);
  }
  getQuestionsByProblem(problemId) {
    return this._questions.filter(q => q.problemId === problemId);
  }

  // --- Financial Model Links ---
  getLinkForIdea(ideaId) { return this._fmLinkIndex.get(ideaId) || null; }
  getAllLinks() { return [...this._fmLinks]; }

  // --- Population funnel chain ---
  /**
   * Returns the full funnel chain from universe to affected for a given idea.
   * Follows parentPopulationId links.
   */
  getPopulationFunnel(leafPopulationId) {
    const chain = [];
    let current = this.getPopulation(leafPopulationId);
    while (current) {
      chain.unshift(current);
      current = current.parentPopulationId ? this.getPopulation(current.parentPopulationId) : null;
    }
    return chain;
  }
}

// Singleton
const censusStore = new CensusStore();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CensusStore, censusStore };
} else {
  window.censusStore = censusStore;
}
