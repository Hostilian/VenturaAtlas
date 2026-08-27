/** VenturaAtlas Chessboard — private Market Structure Lab UI. */

function initChessboardLab() {
  const root = document.getElementById('chessboardApp');
  const api = window.VAChessboard;
  const engine = window.ChessboardEngine;
  if (!root || !api) return;

  const store = new api.ChessboardStore();
  let notice = store.getRecoveryWarning();
  let noticeIsError = Boolean(notice);
  let selectedClaimId = null;
  let viewMarketId = '';
  let selectedThreatActorRef = '';

  const esc = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
  const words = value => esc(String(value ?? 'UNKNOWN').replaceAll('_', ' '));
  const array = value => Array.isArray(value) ? value : [];
  const textOrUnknown = value => value === null || value === undefined || value === '' ? 'UNKNOWN' : String(value);
  const safeUrl = value => {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch (_error) {
      return null;
    }
  };
  const formatDate = value => {
    if (!value || !Number.isFinite(Date.parse(value))) return 'UNKNOWN';
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value));
  };

  function actorName(ws, actorRef) {
    return ws.actors.find(item => item.actorId === actorRef)?.name || actorRef || 'UNKNOWN';
  }

  function layerName(ws, layerRef) {
    return ws.valueChainLayers.find(item => item.layerId === layerRef)?.name || layerRef || 'UNKNOWN';
  }

  function controlName(ws, controlRef) {
    return ws.controlPoints.find(item => item.controlPointId === controlRef)?.controlledResource || controlRef || 'UNKNOWN';
  }

  function stateBadge(state = 'UNKNOWN') {
    return `<span class="chessboard-state" data-state="${esc(state)}">${words(state)}</span>`;
  }

  function listItems(items, formatter = item => esc(item), empty = 'UNKNOWN') {
    const values = array(items);
    return values.length ? `<ul>${values.map(item => `<li>${formatter(item)}</li>`).join('')}</ul>` : `<span class="chessboard-muted">${esc(empty)}</span>`;
  }

  function inlineList(items, formatter = item => String(item), empty = 'UNKNOWN') {
    const values = array(items);
    return esc(values.length ? values.map(formatter).join(' · ') : empty);
  }

  function summaryCard(label, value, note) {
    return `<article class="panel chessboard-summary-card">
      <div class="chessboard-summary-card__label">${esc(label)}</div>
      <div class="chessboard-summary-card__value">${esc(value)}</div>
      <div class="chessboard-summary-card__note">${esc(note)}</div>
    </article>`;
  }

  function briefValue(value) {
    if (value === null || value === undefined || value === '' || value === 'UNKNOWN') return stateBadge('UNKNOWN');
    if (Array.isArray(value)) return inlineList(value, item => item?.name || item?.question || item?.scenarioId || item);
    if (typeof value !== 'object') return esc(value);
    const headline = value.name || value.question || value.resource || value.controlledResource || value.capability ||
      value.positionType || value.mechanism || value.action || value.status || 'RECORDED';
    const detail = value.impact || value.claim || value.customerValue || value.abilityMechanism || value.reason || '';
    return `<strong>${words(headline)}</strong>${detail ? `<br><span class="small">${esc(detail)}</span>` : ''}`;
  }

  function renderStrategicBrief(ws) {
    const brief = engine?.buildStrategicBrief?.(ws);
    if (!brief) return '<section class="panel chessboard-section"><h2>Market Structure Brief</h2><p class="empty">UNKNOWN — deterministic brief engine is unavailable.</p></section>';
    const fields = [
      ['Venture', brief.venture?.name],
      ['Market definitions', brief.marketDefinitions],
      ['Customer job', brief.customerJob],
      ['Value-chain position', brief.valueChainPosition],
      ['Main control point', brief.mainControlPoint],
      ['Who controls it', brief.mainControlPointOwner],
      ['Main direct competitor', brief.mainDirectCompetitor],
      ['Main substitute', brief.mainSubstitute],
      ['Free substitute', brief.freeSubstitute],
      ['Adjacent incumbent', brief.adjacentIncumbent],
      ['Critical upstream dependency', brief.criticalDependency],
      ["Incumbent's cheapest response", brief.incumbentCheapestResponse],
      ['Bundle exposure', brief.bundleExposure],
      ['Multi-homing', brief.multiHoming],
      ['Switching cost', brief.switchingCost],
      ['Commoditizing capability', brief.commoditizingCapability],
      ['Candidate moat', brief.candidateMoat],
      ['Moat status', brief.moatStatus],
      ['Anti-moat', brief.antiMoat],
      ['Structural kill threat', brief.structuralKillThreat],
      ['Strategic position', brief.strategicPosition],
      ['Biggest unknown', brief.biggestUnknown],
      ['Next research question', brief.nextResearchQuestion]
    ];
    const selectionBlocked = ws.selectionAuthority?.state !== 'AUTHORITATIVE_ACTIVE_VENTURE';
    return `<section class="panel chessboard-section" aria-labelledby="strategic-brief-title">
      <header><div class="chessboard-title-row"><div><div class="eyebrow">Deterministic synthesis</div><h2 id="strategic-brief-title">Market Structure Brief</h2></div>${stateBadge(ws.selectionAuthority?.state || 'UNKNOWN')}</div>
        <p>Every field is derived from the imported structured workspace. Missing evidence remains UNKNOWN.</p></header>
      ${selectionBlocked ? '<div class="notice" role="status"><strong>Completion blocker:</strong> this is provisional dogfood, not an authoritatively selected active venture.</div>' : ''}
      <dl class="chessboard-dl chessboard-brief-grid">${fields.map(([label, value]) => `<dt>${esc(label)}</dt><dd>${briefValue(value)}</dd>`).join('')}</dl>
    </section>`;
  }

  function sourceCard(ws, sourceId) {
    const source = ws.sourceRecords.find(item => item.sourceId === sourceId);
    if (!source) {
      return `<article class="chessboard-source-card chessboard-unknown"><p><strong>${esc(sourceId)}</strong></p><p>UNKNOWN — source record is not present in this workspace.</p></article>`;
    }
    const url = safeUrl(source.url);
    const title = url
      ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a>`
      : `<strong>${esc(source.title)}</strong>`;
    return `<article class="chessboard-source-card">
      <p>${title}</p>
      <p><code>${esc(source.sourceId)}</code> · ${words(source.sourceClass)} · ${words(source.status)}</p>
      <p>Published ${esc(formatDate(source.publishedAt))} · verified ${esc(formatDate(source.lastVerifiedAt))} · retrieved ${esc(formatDate(source.retrievedAt))}</p>
      <p>Visibility ${words(source.visibility)} · evidence eligible ${source.evidenceEligible ? 'yes' : 'no'} · provenance eligible ${source.provenanceEligible ? 'yes' : 'no'}</p>
    </article>`;
  }

  function sourceCards(ws, refs, emptyMessage) {
    const values = array(refs);
    return values.length
      ? values.map(ref => sourceCard(ws, ref)).join('')
      : `<p class="empty">${esc(emptyMessage)}</p>`;
  }

  function toolbar(ws, summary) {
    return `<section class="panel chessboard-toolbar" aria-label="Private workspace controls">
      <div>
        <strong>Private data portability</strong>
        <p class="small">Validated replacement only. An in-session rollback is available after import or reset.</p>
      </div>
      <div class="chessboard-actions">
        <label class="button secondary chessboard-file-label" for="importChessboard">Import private JSON</label>
        <input id="importChessboard" type="file" accept="application/json,.json" class="sr-only">
        <button class="button secondary" id="exportChessboard" type="button" ${summary.empty ? 'disabled' : ''}>Export private JSON</button>
        <button class="button secondary" id="rollbackChessboard" type="button" ${store.canRollback() ? '' : 'disabled'}>Undo last replacement</button>
        <button class="button chessboard-button-danger" id="resetChessboard" type="button" ${summary.empty ? 'disabled' : ''}>Reset local data</button>
      </div>
    </section>`;
  }

  function renderEmpty(ws, summary) {
    root.innerHTML = `
      ${notice ? `<div class="notice" id="chessboardNotice" role="alert" tabindex="-1" data-error="${noticeIsError}">${esc(notice)}</div>` : ''}
      <div id="chessboardStatus" class="sr-only" role="status" aria-live="polite"></div>
      <section class="chessboard-empty">
        <div class="chessboard-empty__inner">
          <div class="eyebrow">Chessboard · local/private workspace</div>
          <h1>No strategy workspace loaded</h1>
          <p>This is a valid empty local state, not a loading failure and not evidence that the market has no actors or threats. Import an explicitly selected, schema-versioned private JSON file to begin.</p>
          <label class="button primary chessboard-file-label" for="importChessboard">Import private Chessboard JSON</label>
          <p class="small">No private workspace is fetched automatically. Public shell/status assets may load; workspace <code>${esc(ws.workspaceId)}</code> exists only in this browser.</p>
        </div>
      </section>
      ${toolbar(ws, summary)}`;
    bindHandlers(ws, summary);
  }

  function renderMarketDefinitions(ws) {
    const selectedMarket = viewMarketId && ws.marketDefinitions.some(item => item.marketId === viewMarketId) ? viewMarketId : '';
    const options = ws.marketDefinitions.map(item => `<option value="${esc(item.marketId)}" ${item.marketId === selectedMarket ? 'selected' : ''}>${esc(item.name)}</option>`).join('');
    return `<section class="panel chessboard-section" aria-labelledby="market-boundaries-title">
      <header>
        <div class="chessboard-title-row"><div><div class="eyebrow">Boundary first</div><h2 id="market-boundaries-title">Alternative market definitions</h2></div><span class="chip">${ws.marketDefinitions.length} retained</span></div>
        <p>Alternative frames remain visible because the venture label does not determine the purchased job or competing budget.</p>
        <div class="chessboard-selection">
          <label>View ecosystem through a market frame
            <select id="marketView"><option value="">All retained frames</option>${options}</select>
          </label>
          <span class="chessboard-provisional">View filter only · not authority</span>
        </div>
      </header>
      <div class="chessboard-card-grid">
        ${ws.marketDefinitions.map(item => `<article class="chessboard-card">
          <div class="chessboard-title-row"><div><code>${esc(item.marketId)}</code><h3>${esc(item.name)}</h3></div>${stateBadge(item.epistemicState)}</div>
          <dl class="chessboard-dl">
            <dt>Jobs</dt><dd>${listItems(item.jobs)}</dd>
            <dt>Buyers</dt><dd>${inlineList(item.buyerActorRefs, ref => actorName(ws, ref))}</dd>
            <dt>Budget</dt><dd>${esc(item.budget)}</dd>
            <dt>Included alternatives</dt><dd>${inlineList(item.includedAlternativeActorRefs, ref => actorName(ws, ref), 'NONE RECORDED')}</dd>
            <dt>Excluded alternatives</dt><dd>${inlineList(item.excludedAlternativeActorRefs, ref => actorName(ws, ref), 'NONE RECORDED')}</dd>
            <dt>Boundary reason</dt><dd>${esc(item.reason)}</dd>
            <dt>Confidence</dt><dd>${words(item.confidence)}</dd>
            <dt>Sources</dt><dd>${esc(item.sourceRefs.length)} linked</dd>
          </dl>
        </article>`).join('')}
      </div>
    </section>`;
  }

  function renderValueChain(ws) {
    const layers = [...ws.valueChainLayers].sort((a, b) => a.sequence - b.sequence);
    return `<section class="panel chessboard-section" aria-labelledby="value-chain-title">
      <header><div class="eyebrow">Creation is not capture</div><h2 id="value-chain-title">Value chain</h2><p>Each layer exposes its actors, exchange, economics, switching conditions, concentration, and control interfaces.</p></header>
      <div class="chessboard-value-chain">
        ${layers.map((item, index) => `<article class="chessboard-layer">
          <div class="chessboard-title-row"><div><span class="eyebrow">Layer ${index + 1}</span><h3>${esc(item.name)}</h3></div>${stateBadge(item.epistemicState)}</div>
          <dl class="chessboard-dl">
            <dt>Actors</dt><dd>${inlineList(item.actorRefs, ref => actorName(ws, ref))}</dd>
            <dt>Inputs</dt><dd>${inlineList(item.inputs)}</dd>
            <dt>Outputs</dt><dd>${inlineList(item.outputs)}</dd>
            <dt>Economics</dt><dd>${esc(item.economics)}</dd>
            <dt>Switching</dt><dd>${esc(item.switching)}</dd>
            <dt>Concentration</dt><dd>${words(item.concentration)}</dd>
            <dt>Commodity state</dt><dd>${words(item.commodityState)}</dd>
            <dt>Control points</dt><dd>${inlineList(item.controlPointRefs, ref => controlName(ws, ref), 'NONE RECORDED')}</dd>
          </dl>
        </article>`).join('')}
      </div>
    </section>`;
  }

  function renderActorsAndEdges(ws) {
    const frameActorIds = viewMarketId
      ? new Set(ws.actors.filter(actor => actor.marketRefs.includes(viewMarketId)).map(actor => actor.actorId))
      : null;
    const actors = frameActorIds ? ws.actors.filter(actor => frameActorIds.has(actor.actorId)) : ws.actors;
    const edges = ws.ecosystemEdges.filter(edge => !viewMarketId || edge.marketRefs.includes(viewMarketId));
    return `<section class="panel chessboard-section" aria-labelledby="ecosystem-title">
      <header><div class="chessboard-title-row"><div><div class="eyebrow">Actors and mechanisms</div><h2 id="ecosystem-title">Ecosystem registry</h2></div><span class="chip">${actors.length} actors · ${edges.length} typed edges</span></div><p>Actor type is not the mechanism. Edges state how access, value, substitution, or control actually moves.</p></header>
      <div class="chessboard-card-grid">
        ${actors.map(item => `<article class="chessboard-card">
          <div class="chessboard-title-row"><div><code>${esc(item.actorId)}</code><h3>${esc(item.name)}</h3></div>${stateBadge(item.epistemicState)}</div>
          <p><span class="chip">${words(item.type)}</span></p>
          <dl class="chessboard-dl">
            <dt>Assets</dt><dd>${inlineList(item.assets, undefined, 'NONE RECORDED')}</dd>
            <dt>Incentives</dt><dd>${listItems(item.incentives)}</dd>
            <dt>Target buyer</dt><dd>${esc(textOrUnknown(item.targetBuyer))}</dd>
            <dt>Core job</dt><dd>${esc(textOrUnknown(item.coreJob))}</dd>
            <dt>Pricing</dt><dd>${esc(textOrUnknown(item.pricing))}</dd>
            <dt>Distribution</dt><dd>${inlineList(item.distribution, undefined, 'UNKNOWN')}</dd>
            <dt>Trajectory</dt><dd>${esc(textOrUnknown(item.trajectory))}</dd>
            <dt>Strategic intent</dt><dd>${esc(textOrUnknown(item.strategicIntent))}</dd>
            <dt>Dependencies</dt><dd>${esc(item.dependencyRefs.length)} linked</dd>
            <dt>Controls</dt><dd>${esc(item.controlPointRefs.length)} linked</dd>
          </dl>
        </article>`).join('') || '<p class="empty">No actors belong to this market frame.</p>'}
      </div>
      <h3 class="chessboard-subheading">Typed ecosystem edges</h3>
      <div class="chessboard-edge-list">
        ${edges.map(item => `<article class="chessboard-edge">
          <div><strong>${esc(actorName(ws, item.fromActorRef))}</strong></div>
          <div><div class="chessboard-edge__type">${words(item.type)}</div><p class="small">${esc(item.mechanism)}</p></div>
          <div class="chessboard-edge__target"><strong>${esc(actorName(ws, item.toActorRef))}</strong> ${stateBadge(item.epistemicState)}</div>
        </article>`).join('') || '<p class="empty">No typed ecosystem edges are recorded for this frame.</p>'}
      </div>
    </section>`;
  }

  function renderSubstitutes(ws) {
    const types = new Set(['DIRECT_COMPETITOR', 'INDIRECT_COMPETITOR', 'SUBSTITUTE', 'STATUS_QUO', 'OPEN_SOURCE_PROJECT', 'INTERNAL_BUILD_TEAM', 'ADJACENT_INCUMBENT']);
    const marketAlternativeRefs = new Set(ws.marketDefinitions.flatMap(market => array(market.includedAlternativeActorRefs)));
    const alternatives = ws.actors.filter(actor => types.has(actor.type) || marketAlternativeRefs.has(actor.actorId));
    return `<section class="panel chessboard-section" aria-labelledby="substitutes-title">
      <header><div class="eyebrow">Competes for the job or budget</div><h2 id="substitutes-title">Competitors, substitutes, free paths, and internal build</h2><p>Direct products are shown beside status quo, open-source, adjacent, and customer-built alternatives.</p></header>
      <div class="chessboard-card-grid">
        ${alternatives.map(item => `<article class="chessboard-card">
          <div class="chessboard-title-row"><h3>${esc(item.name)}</h3>${stateBadge(item.epistemicState)}</div>
          <p><span class="chip">${words(item.type)}</span></p>
          <dl class="chessboard-dl"><dt>Target buyer</dt><dd>${esc(textOrUnknown(item.targetBuyer))}</dd><dt>Core job</dt><dd>${esc(textOrUnknown(item.coreJob))}</dd><dt>Pricing</dt><dd>${esc(textOrUnknown(item.pricing))}</dd><dt>Distribution</dt><dd>${inlineList(item.distribution, undefined, 'UNKNOWN')}</dd><dt>Assets</dt><dd>${inlineList(item.assets, undefined, 'NONE RECORDED')}</dd><dt>Incentives</dt><dd>${listItems(item.incentives)}</dd><dt>Markets</dt><dd>${inlineList(item.marketRefs, ref => ws.marketDefinitions.find(market => market.marketId === ref)?.name || ref)}</dd>${item.openSourceProfile ? `<dt>Open-source profile</dt><dd>License: ${esc(item.openSourceProfile.license)}<br>Latest release: ${esc(item.openSourceProfile.latestRelease)} (${esc(formatDate(item.openSourceProfile.latestReleaseAt))})<br>Activity: ${esc(item.openSourceProfile.activity)}<br>Contributors: ${esc(item.openSourceProfile.contributors)}<br>Cadence: ${esc(item.openSourceProfile.releaseCadence)}<br>Backing: ${esc(item.openSourceProfile.commercialBacking)}<br>Deployment burden: ${esc(item.openSourceProfile.deploymentBurden)}<br>Sources: ${inlineList(item.openSourceProfile.sourceRefs)}</dd>` : ''}</dl>
        </article>`).join('') || '<p class="empty">No substitute actors are recorded. This is missing analysis, not evidence of low competition.</p>'}
      </div>
    </section>`;
  }

  function renderStructuralMatrices(ws) {
    const incumbentTypes = new Set(['ADJACENT_INCUMBENT', 'PLATFORM', 'DIRECT_COMPETITOR']);
    const incumbents = ws.actors.filter(actor => incumbentTypes.has(actor.type));
    const competitors = ws.actors.filter(actor => ['DIRECT_COMPETITOR', 'INDIRECT_COMPETITOR', 'ADJACENT_INCUMBENT'].includes(actor.type));
    const responseRows = actor => ws.responses.filter(response => response.actorRef === actor.actorId);
    const matchingAssets = (actor, pattern) => actor.assets.filter(asset => pattern.test(asset));
    return `<section class="panel chessboard-section" aria-labelledby="structural-matrices-title">
      <header><div class="eyebrow">No combined score</div><h2 id="structural-matrices-title">Incumbent and competitor difference matrices</h2><p>Assets, conflicts, timing, pricing, and distribution stay separate so an installed base is not mistaken for an inevitable win.</p></header>
      <h3 class="chessboard-subheading">Incumbent response capacity</h3>
      <div class="table-wrap"><table class="chessboard-table"><thead><tr><th>Actor</th><th>Customers</th><th>Distribution</th><th>Technology / data</th><th>Capital / brand</th><th>Integrations / bundling</th><th>Conflicts</th><th>Response speed</th></tr></thead><tbody>
        ${incumbents.map(actor => {
          const responses = responseRows(actor);
          const bundle = responses.filter(response => ['BUNDLE', 'MAKE_FEATURE_FREE'].includes(response.possibleAction));
          return `<tr><th scope="row">${esc(actor.name)}<br>${stateBadge(actor.epistemicState)}</th><td>${esc(textOrUnknown(actor.targetBuyer))}</td><td>${inlineList(actor.distribution, undefined, 'UNKNOWN')}</td><td>${inlineList(matchingAssets(actor, /data|catalog|model|technology|workflow|capture|q&a|search/i), undefined, 'UNKNOWN')}</td><td>Capital: UNKNOWN<br><span class="small">Brand/distribution evidence: ${inlineList(matchingAssets(actor, /brand|users|customer|retail|shopping/i), undefined, 'UNKNOWN')}</span></td><td>${inlineList(matchingAssets(actor, /integration|billing|distribution|product page|suite|identity/i), undefined, 'UNKNOWN')}<br><span class="small">Bundle paths: ${bundle.length || 'NONE RECORDED'}</span></td><td>${listItems(responses.flatMap(response => response.constraints), value => esc(value), 'UNKNOWN')}</td><td>${inlineList(responses.map(response => response.timeToExecute), undefined, 'UNKNOWN')}</td></tr>`;
        }).join('') || '<tr><td colspan="8">No incumbent records.</td></tr>'}
      </tbody></table></div>
      <h3 class="chessboard-subheading">Structural competitor differences</h3>
      <div class="table-wrap"><table class="chessboard-table"><thead><tr><th>Actor</th><th>Target buyer</th><th>Core job</th><th>Pricing</th><th>Distribution</th><th>Controlled assets</th><th>Dependencies</th><th>Trajectory</th></tr></thead><tbody>
        ${competitors.map(actor => `<tr><th scope="row">${esc(actor.name)}<br><span class="small">${words(actor.type)}</span></th><td>${esc(textOrUnknown(actor.targetBuyer))}</td><td>${esc(textOrUnknown(actor.coreJob))}</td><td>${esc(textOrUnknown(actor.pricing))}</td><td>${inlineList(actor.distribution, undefined, 'UNKNOWN')}</td><td>${inlineList(actor.assets, undefined, 'UNKNOWN')}</td><td>${inlineList(actor.dependencyRefs, undefined, 'NONE RECORDED')}</td><td>${esc(textOrUnknown(actor.trajectory))}</td></tr>`).join('') || '<tr><td colspan="8">No competitor records.</td></tr>'}
      </tbody></table></div>
    </section>`;
  }

  function renderDependencies(ws) {
    return `<section class="panel chessboard-section" aria-labelledby="dependencies-title">
      <header><div class="eyebrow">Who can change access or economics?</div><h2 id="dependencies-title">Dependency and control chain</h2><p>Qualitative levels are preserved from source analysis; Chessboard does not convert them into a radar score.</p></header>
      <div class="chessboard-split">
        <div>
          <h3>Control points</h3>
          <div class="chessboard-card-grid">
            ${ws.controlPoints.map(item => `<article class="chessboard-card">
              <div class="chessboard-title-row"><h3>${esc(item.controlledResource)}</h3>${stateBadge(item.epistemicState)}</div>
              <dl class="chessboard-dl">
                <dt>Layer</dt><dd>${esc(layerName(ws, item.layerRef))}</dd>
                <dt>Controller</dt><dd>${esc(actorName(ws, item.controllerActorRef))}</dd>
                <dt>Mechanism</dt><dd>${esc(item.mechanism)}</dd>
                <dt>Dependents</dt><dd>${inlineList(item.dependentActorRefs, ref => actorName(ws, ref))}</dd>
                <dt>Switchability</dt><dd>${words(item.switchability)}</dd>
                <dt>Alternatives</dt><dd>${inlineList(item.alternativeActorRefs, ref => actorName(ws, ref), 'NONE RECORDED')}</dd>
              </dl>
            </article>`).join('') || '<p class="empty">No control points are recorded.</p>'}
          </div>
        </div>
        <div>
          <h3>Control chain</h3>
          <div class="chessboard-chain">
            ${ws.dependencies.map((item, index) => `<article class="chessboard-chain-step" data-step="${index + 1}">
              <div class="chessboard-title-row"><strong>${esc(actorName(ws, item.providerActorRef))} → ${esc(item.resource)}</strong>${stateBadge(item.epistemicState)}</div>
              <p>Dependent: ${esc(item.dependentActorRefs.map(ref => actorName(ws, ref)).join(', '))}</p>
              <p class="small">Control point: ${esc(controlName(ws, item.controlPointRef))} · provider power ${words(item.providerPower)}</p>
            </article>`).join('') || '<p class="empty">No dependencies are recorded.</p>'}
          </div>
        </div>
      </div>
      ${ws.dependencies.length ? `<div class="table-wrap chessboard-table-wrap"><table class="chessboard-table"><thead><tr><th>Resource / provider</th><th>Criticality</th><th>Alternatives</th><th>Switching / multi-homing</th><th>Provider power</th><th>Provider response exposure</th></tr></thead><tbody>
        ${ws.dependencies.map(item => `<tr><th scope="row">${esc(item.resource)}<br><span class="small">${esc(actorName(ws, item.providerActorRef))}</span></th><td>${words(item.criticality)}<br>${stateBadge(item.epistemicState)}</td><td>${inlineList(item.alternativeActorRefs, ref => actorName(ws, ref), 'NO ACTOR ALTERNATIVE')}<br><span class="small">${inlineList(item.alternativeDescriptions, undefined, 'No descriptive alternative')}</span></td><td>Switch cost: ${words(item.switchingCost)}<br><span class="small">Multi-home: ${words(item.multiHoming?.allowed || 'UNKNOWN')} · friction ${words(item.multiHoming?.friction || 'UNKNOWN')}<br>${esc(textOrUnknown(item.multiHoming?.cost))}<br>Contractual: ${inlineList(item.contractualConstraints, undefined, 'NONE RECORDED')}<br>Technical: ${inlineList(item.technicalConstraints, undefined, 'NONE RECORDED')}</span>${item.switchingProcess ? `<details><summary>Switching process</summary>${listItems(Object.entries(item.switchingProcess), ([kind, value]) => `<strong>${words(kind)}:</strong> ${esc(value)}`)}</details>` : ''}</td><td>${words(item.providerPower)}</td><td>Entry ${words(item.providerEntryRisk)} · price ${words(item.priceExposure)} · access ${words(item.accessExposure)}</td></tr>`).join('')}
      </tbody></table></div>` : ''}
    </section>`;
  }

  function renderResponses(ws) {
    const actorRefs = [...new Set([...ws.responses.map(item => item.actorRef), ...ws.stressScenarios.map(item => item.threatActorRef)])];
    if (!actorRefs.includes(selectedThreatActorRef)) selectedThreatActorRef = actorRefs[0] || '';
    const responses = ws.responses.filter(item => !selectedThreatActorRef || item.actorRef === selectedThreatActorRef);
    const scenarios = ws.stressScenarios.filter(item => !selectedThreatActorRef || item.threatActorRef === selectedThreatActorRef);
    const options = actorRefs.map(ref => `<option value="${esc(ref)}" ${ref === selectedThreatActorRef ? 'selected' : ''}>${esc(actorName(ws, ref))}</option>`).join('');
    return `<section class="panel chessboard-section" aria-labelledby="responses-title">
      <header><div class="eyebrow">If traction appears, what happens next?</div><h2 id="responses-title">Threat-actor war game</h2><p>Responses keep ability, incentive, constraints, impact, and venture responses separate. A possible move is a scenario, not an observed announcement.</p>
        <div class="chessboard-selection"><label>Choose threat actor<select id="threatActorView">${options}</select></label><span class="chessboard-provisional">Scenario filter · not a probability</span></div></header>
      ${responses.length ? `<div class="table-wrap"><table class="chessboard-table"><thead><tr><th>Actor / trigger</th><th>Possible response</th><th>Ability</th><th>Incentive / motive</th><th>Constraints</th><th>Impact / time</th><th>Countermoves</th><th>Evidence</th><th>Counterevidence / falsifier</th></tr></thead><tbody>
        ${responses.map(item => `<tr>
          <th scope="row">${esc(actorName(ws, item.actorRef))}<br><span class="small">${esc(item.trigger)}</span><br>${stateBadge(item.epistemicState)}</th>
          <td><strong>${words(item.possibleAction)}</strong><br><span class="small">Targets: ${esc(item.targetActorRefs.map(ref => actorName(ws, ref)).join(', '))}</span></td>
          <td>${words(item.ability)}<br><span class="small">${esc(item.abilityMechanism)}</span></td>
          <td>${words(item.incentive)}<br><span class="small">${esc(item.incentiveMechanism)}</span></td>
          <td>${listItems(item.constraints)}</td>
          <td>${esc(item.likelyImpact)}<br><span class="small">${words(item.timeToExecute)}</span></td>
          <td>${listItems(item.countermoves, value => esc(value), 'NONE RECORDED')}</td>
          <td>${inlineList(item.sourceRefs, undefined, 'UNKNOWN')}</td>
          <td>Counter: ${inlineList(item.counterEvidenceRefs, undefined, 'UNKNOWN')}<p class="small">Falsifier: ${esc(item.falsifier)}</p></td>
        </tr>`).join('')}
      </tbody></table></div>` : '<p class="empty">No response scenarios are recorded. Incumbent reaction remains UNKNOWN.</p>'}
      ${responses.length ? `<h3 class="chessboard-subheading">Attack and countermove tree</h3><div class="chessboard-chain">${responses.map(item => `<article class="chessboard-chain-step"><strong>Destroy standalone economics → ${words(item.possibleAction)}</strong><p>${esc(item.likelyImpact)}</p><div class="small">Countermove branches</div>${listItems(item.countermoves, value => esc(value), 'UNKNOWN')}</article>`).join('')}</div>` : ''}
      ${scenarios.length ? `<h3 class="chessboard-subheading">Selected-actor stress scenarios</h3><div class="chessboard-card-grid">${scenarios.map(item => `<article class="chessboard-card"><div class="chessboard-title-row"><div><span class="eyebrow">${words(item.stressType)}</span><h3>${esc(item.name)}</h3></div>${stateBadge(item.survivalStatus)}</div><dl class="chessboard-dl"><dt>Threat actor</dt><dd>${esc(actorName(ws, item.threatActorRef))}</dd><dt>Trigger</dt><dd>${esc(item.trigger)}</dd><dt>Assumptions</dt><dd>${listItems(item.assumptions)}</dd><dt>Impact</dt><dd>${esc(item.impact)}</dd><dt>Responses</dt><dd>${listItems(item.countermoves, value => esc(value), 'NONE RECORDED')}</dd><dt>Survival condition</dt><dd>${esc(item.survivalCondition)}</dd><dt>Evidence state</dt><dd>${stateBadge(item.epistemicState)} · ${inlineList(item.sourceRefs, undefined, 'UNKNOWN')}</dd><dt>Falsifier</dt><dd>${esc(item.falsifier)}</dd></dl></article>`).join('')}</div>` : ''}
      ${ws.stressScenarios.length ? `<h3 class="chessboard-subheading">Strategic survival table · all required futures</h3><div class="table-wrap"><table class="chessboard-table"><thead><tr><th>Stress type</th><th>Scenario</th><th>Threat actor</th><th>Survival</th><th>Mechanism / impact</th><th>Survival condition</th></tr></thead><tbody>${ws.stressScenarios.map(item => `<tr><th scope="row">${words(item.stressType)}</th><td>${esc(item.name)}</td><td>${esc(actorName(ws, item.threatActorRef))}</td><td>${stateBadge(item.survivalStatus)}</td><td>${esc(item.impact)}</td><td>${esc(item.survivalCondition)}</td></tr>`).join('')}</tbody></table></div>` : ''}
    </section>`;
  }

  function renderMoats(ws) {
    return `<section class="panel chessboard-section" aria-labelledby="moats-title">
      <header><div class="eyebrow">Mechanism, attacker, decay</div><h2 id="moats-title">Candidate moat mechanisms</h2><p>Status is conditional and evidence-linked. No scalar “defensibility” score is calculated.</p></header>
      <div class="chessboard-card-grid">
        ${ws.moatMechanisms.map(item => `<article class="chessboard-card">
          <div class="chessboard-title-row"><div><span class="eyebrow">${words(item.status)}</span><h3>${words(item.mechanism)}</h3></div><div class="chessboard-meta-row">${stateBadge(item.epistemicState)}<span class="chip">Half-life ${words(item.halfLife)}</span></div></div>
          <dl class="chessboard-dl">
            <dt>Asset</dt><dd>${esc(item.asset)}</dd>
            <dt>Owner</dt><dd>${esc(actorName(ws, item.ownerActorRef))}</dd>
            <dt>Accumulation</dt><dd>${esc(item.accumulationProcess)}</dd>
            <dt>Customer effect</dt><dd>${esc(item.customerEffect)}</dd>
            <dt>Attackers</dt><dd>${inlineList(item.attackerActorRefs, ref => actorName(ws, ref))}</dd>
            <dt>Attacker cost</dt><dd>${esc(item.attackerCost)}</dd>
            <dt>Replication</dt><dd>${words(item.timeToReplicate)}</dd>
            <dt>Conditions</dt><dd>${listItems(item.conditions)}</dd>
            <dt>Decay</dt><dd>${listItems(item.decayRisks)}</dd>
            <dt>Evidence</dt><dd>${inlineList(item.evidenceRefs, undefined, 'UNKNOWN')}</dd>
            <dt>Counterevidence</dt><dd>${inlineList(item.counterEvidenceRefs, undefined, 'UNKNOWN')}</dd>
            <dt>Related claims</dt><dd>${inlineList(item.relatedClaimRefs)}</dd>
            <dt>Falsifier</dt><dd>${esc(item.falsifier)}</dd>
          </dl>
        </article>`).join('') || '<p class="empty">No candidate moat mechanism is recorded. This does not mean “no moat”; the status is UNKNOWN.</p>'}
      </div>
      ${ws.positions.length ? `<h3 class="chessboard-subheading">Candidate strategic positions</h3><div class="chessboard-card-grid">${ws.positions.map(item => `<article class="chessboard-card"><div class="chessboard-title-row"><h3>${words(item.positionType)}</h3>${stateBadge(item.epistemicState)}</div><p><span class="chip">${words(item.status)}</span></p><dl class="chessboard-dl"><dt>Layer</dt><dd>${esc(layerName(ws, item.targetLayerRef))}</dd><dt>Customer value</dt><dd>${esc(item.customerValue)}</dd><dt>Control points</dt><dd>${inlineList(item.controlPointRefs, ref => controlName(ws, ref), 'NONE RECORDED')}</dd><dt>Dependencies</dt><dd>${inlineList(item.dependencyRefs)}</dd><dt>Controlled assets</dt><dd>${inlineList(item.controlledAssets, undefined, 'NONE RECORDED')}</dd><dt>Required assets</dt><dd>${listItems(item.requiredAssets)}</dd><dt>Switching</dt><dd>${esc(item.switching)}</dd><dt>Distribution</dt><dd>${esc(item.distribution)}</dd><dt>Commoditization</dt><dd>${inlineList(item.commoditizationRiskRefs)}</dd><dt>Competitive responses</dt><dd>${inlineList(item.responseRefs)}</dd><dt>Evidence</dt><dd>${inlineList(item.evidenceRefs, undefined, 'UNKNOWN')}</dd><dt>Counterevidence</dt><dd>${inlineList(item.counterEvidenceRefs, undefined, 'UNKNOWN')}</dd><dt>Vulnerabilities</dt><dd>${listItems(item.vulnerabilities)}</dd><dt>Falsifier</dt><dd>${esc(item.falsifier)}</dd></dl></article>`).join('')}</div>
      <h3 class="chessboard-subheading">Position comparison</h3><div class="table-wrap"><table class="chessboard-table"><thead><tr><th>Position</th><th>Control</th><th>Dependency</th><th>Competitive response</th><th>Commoditization</th><th>Switching</th><th>Distribution</th><th>Required assets</th></tr></thead><tbody>${ws.positions.map(item => `<tr><th scope="row">${words(item.positionType)}<br>${stateBadge(item.status)}</th><td>${inlineList(item.controlPointRefs, ref => controlName(ws, ref), 'NONE')}</td><td>${inlineList(item.dependencyRefs, undefined, 'NONE')}</td><td>${inlineList(item.responseRefs, undefined, 'NONE')}</td><td>${inlineList(item.commoditizationRiskRefs, undefined, 'NONE')}</td><td>${esc(item.switching)}</td><td>${esc(item.distribution)}</td><td>${inlineList(item.requiredAssets, undefined, 'UNKNOWN')}</td></tr>`).join('')}</tbody></table></div>` : ''}
    </section>`;
  }

  function renderAntiMoatsAndCommoditization(ws) {
    return `<section class="panel chessboard-section" aria-labelledby="erosion-title">
      <header><div class="eyebrow">What compounds against the venture?</div><h2 id="erosion-title">Anti-moats and commoditization</h2><p>Risks name their growth trigger or external driver, time horizon, remaining impact, and falsifier—never a radar score.</p></header>
      <div class="chessboard-split">
        <div><h3>Anti-moats</h3><div class="chessboard-card-grid">
          ${ws.antiMoats.map(item => `<article class="chessboard-card"><div class="chessboard-title-row"><div><span class="eyebrow">${words(item.status)}</span><h3>${esc(item.mechanism)}</h3></div>${stateBadge(item.epistemicState)}</div><dl class="chessboard-dl"><dt>Affected actor</dt><dd>${esc(actorName(ws, item.actorRef))}</dd><dt>Attackers / beneficiaries</dt><dd>${inlineList(item.attackerActorRefs, ref => actorName(ws, ref), 'UNKNOWN')}</dd><dt>Growth trigger</dt><dd>${esc(item.growthTrigger)}</dd><dt>Negative effect</dt><dd>${esc(item.negativeEffect)}</dd><dt>Scaling behavior</dt><dd>${esc(item.scalingBehavior)}</dd><dt>Conditions</dt><dd>${listItems(item.conditions)}</dd><dt>Relief / decay risks</dt><dd>${listItems(item.decayRisks)}</dd><dt>Mitigations</dt><dd>${listItems(item.possibleMitigations, value => esc(value), 'NONE RECORDED')}</dd><dt>Evidence</dt><dd>${inlineList(item.evidenceRefs, undefined, 'UNKNOWN')}</dd><dt>Counterevidence</dt><dd>${inlineList(item.counterEvidenceRefs, undefined, 'UNKNOWN')}</dd><dt>Related claims</dt><dd>${inlineList(item.relatedClaimRefs)}</dd><dt>Falsifier</dt><dd>${esc(item.falsifier)}</dd></dl></article>`).join('') || '<p class="empty">No anti-moat mechanism is recorded.</p>'}
        </div></div>
        <div><h3>Specific commoditization risks</h3><div class="chessboard-card-grid">
          ${ws.commoditizationRisks.map(item => `<article class="chessboard-card"><div class="chessboard-title-row"><h3>${esc(item.capability)}</h3>${stateBadge(item.epistemicState)}</div><dl class="chessboard-dl"><dt>Current differentiation</dt><dd>${esc(item.currentDifferentiation)}</dd><dt>Drivers</dt><dd>${inlineList(item.drivers)}</dd><dt>Replacement sources</dt><dd>${listItems(item.replacementSources)}</dd><dt>Cost trend</dt><dd>${words(item.costTrend)}</dd><dt>Availability</dt><dd>${words(item.availabilityTrend)}</dd><dt>Horizon</dt><dd>${words(item.timeHorizon)}</dd><dt>Venture impact</dt><dd>${esc(item.ventureImpact)}</dd><dt>Remaining differentiation</dt><dd>${esc(item.remainingDifferentiation)}</dd><dt>Evidence</dt><dd>${inlineList(item.evidenceRefs, undefined, 'UNKNOWN')}</dd><dt>Counterevidence</dt><dd>${inlineList(item.counterEvidenceRefs, undefined, 'UNKNOWN')}</dd><dt>Falsifier</dt><dd>${esc(item.falsifier)}</dd></dl></article>`).join('') || '<p class="empty">No commoditization risk is recorded.</p>'}
        </div></div>
      </div>
    </section>`;
  }

  function renderTimeline(ws) {
    const events = [...ws.events].sort((a, b) => Date.parse(b.eventDate) - Date.parse(a.eventDate));
    return `<section class="panel chessboard-section" aria-labelledby="timeline-title">
      <header><div class="eyebrow">Structural change, not news volume</div><h2 id="timeline-title">Market event timeline</h2><p>Observed event descriptions remain separate from their strategic implications.</p></header>
      <div class="chessboard-timeline">
        ${events.map(item => `<article class="chessboard-event">
          <time datetime="${esc(item.eventDate)}">Event ${esc(formatDate(item.eventDate))}</time>
          <h3>${words(item.eventType)} · ${esc(item.actorRefs.map(ref => actorName(ws, ref)).join(', '))}</h3>
          <p class="small"><strong>Observed / article checked:</strong> ${esc(formatDate(item.observedAt))}</p>
          <p><strong>Observed event:</strong> ${esc(item.description)}</p>
          <p><strong>Strategic implication:</strong> ${esc(item.strategicImplication)} ${stateBadge(item.implicationState)}</p>
          <p class="small"><strong>Affected:</strong> layers ${inlineList(item.affectedLayerRefs, ref => layerName(ws, ref), 'NONE')} · controls ${inlineList(item.affectedControlPointRefs, ref => controlName(ws, ref), 'NONE')} · dependencies ${inlineList(item.affectedDependencyRefs, undefined, 'NONE')}</p>
          <p class="small"><strong>Sources:</strong> ${inlineList(item.sourceRefs, undefined, 'UNKNOWN')}</p>
        </article>`).join('') || '<p class="empty">No material market event is recorded.</p>'}
      </div>
    </section>`;
  }

  function unknownLabel(collection, record) {
    const labels = {
      marketDefinitions: record.name,
      actors: record.name,
      valueChainLayers: record.name,
      controlPoints: record.controlledResource,
      dependencies: record.resource,
      ecosystemEdges: record.mechanism,
      responses: record.possibleAction,
      strategicClaims: record.claim,
      antiMoats: record.mechanism,
      commoditizationRisks: record.capability,
      events: record.strategicImplication
    };
    return labels[collection] || 'Unresolved record';
  }

  function renderResearchQueue(ws) {
    const unknowns = [];
    for (const collection of api.CHESSBOARD_COLLECTIONS) {
      for (const record of ws[collection] || []) {
        if (record.epistemicState === 'UNKNOWN' || record.implicationState === 'UNKNOWN') {
          unknowns.push({ collection, label: unknownLabel(collection, record) });
        }
      }
    }
    const priority = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const gaps = [...ws.researchGaps].sort((a, b) => (priority[a.decisionRelevance] ?? 9) - (priority[b.decisionRelevance] ?? 9));
    return `<section class="panel chessboard-section" aria-labelledby="unknowns-title">
      <header><div class="eyebrow">Missing stays missing</div><h2 id="unknowns-title">Explicit UNKNOWNs and research queue</h2><p>Questions are ordered by stated decision relevance, not by curiosity or an invented confidence score.</p></header>
      <div class="chessboard-split">
        <div><h3>Records explicitly marked UNKNOWN</h3>
          <ol class="chessboard-list">${unknowns.map(item => `<li class="chessboard-unknown"><strong>${words(item.collection)}</strong><br>${esc(item.label)}</li>`).join('') || '<li>No record-level UNKNOWN state is present. This does not imply complete knowledge.</li>'}</ol>
        </div>
        <div><h3>Decision-relevant research</h3>
          <ol class="chessboard-list">${gaps.map(item => `<li class="chessboard-unknown"><div class="chessboard-title-row"><strong>${esc(item.question)}</strong><span class="chip">${words(item.decisionRelevance)} · ${words(item.status)}</span></div><p><strong>What changes:</strong> ${esc(item.whatChanges)}</p><p><strong>Required evidence:</strong> ${inlineList(item.requiredEvidence)}</p><p><strong>Next action:</strong> ${esc(item.nextAction)}</p></li>`).join('') || '<li>No explicit research gap is recorded.</li>'}</ol>
        </div>
      </div>
    </section>`;
  }

  function renderContradictions(ws) {
    const contradictions = engine?.detectContradictions?.(ws) || [];
    return `<section class="panel chessboard-section" aria-labelledby="contradictions-title">
      <header><div class="eyebrow">Claim versus mechanism</div><h2 id="contradictions-title">Strategic contradictions</h2><p>Counterevidence is not automatically a contradiction. This view lists only declared or deterministically detected conflicts that require resolution.</p></header>
      <div class="chessboard-card-grid">${contradictions.map(item => `<article class="chessboard-card"><div class="chessboard-title-row"><h3>${words(item.kind)}</h3>${stateBadge(item.status)}</div>${item.mechanism ? `<p>${esc(item.mechanism)}</p>` : ''}<p><strong>Claims:</strong> ${inlineList(item.claimRefs, undefined, 'NONE RECORDED')}</p>${item.recordRefs?.length ? `<p><strong>Records:</strong> ${inlineList(item.recordRefs)}</p>` : ''}<p><code>${esc(item.contradictionId)}</code></p></article>`).join('') || '<p class="empty">No explicit contradiction is currently detected. This does not prove the thesis is coherent.</p>'}</div>
    </section>`;
  }

  function renderClaimTrace(ws) {
    if (!selectedClaimId || !ws.strategicClaims.some(item => item.claimId === selectedClaimId)) selectedClaimId = ws.strategicClaims[0]?.claimId || null;
    const claim = ws.strategicClaims.find(item => item.claimId === selectedClaimId);
    return `<section class="panel chessboard-section" aria-labelledby="claim-ledger-title">
      <header><div class="eyebrow">Click a claim to inspect both sides</div><h2 id="claim-ledger-title">Strategic claim trace</h2><p>Each claim exposes mechanism, actor, asset or control point, conditions, supporting evidence, counterevidence, time horizon, and falsifier.</p></header>
      <div class="chessboard-trace-grid">
        <div class="chessboard-claim-list" role="list" aria-label="Strategic claims">
          ${ws.strategicClaims.map(item => `<button class="chessboard-claim-button" type="button" role="listitem" data-claim-id="${esc(item.claimId)}" aria-current="${item.claimId === selectedClaimId}"><span><code>${esc(item.claimId)}</code> · ${esc(item.subject)}</span><strong>${esc(item.claim)}</strong><span>${stateBadge(item.epistemicState)} ${esc(item.evidenceRefs.length)} support · ${esc(item.counterEvidenceRefs.length)} counter</span></button>`).join('')}
        </div>
        ${claim ? `<article class="chessboard-trace-panel" aria-live="polite">
          <div class="chessboard-title-row"><div><code>${esc(claim.claimId)}</code><h3 id="activeClaimTitle" tabindex="-1">${esc(claim.claim)}</h3></div>${stateBadge(claim.epistemicState)}</div>
          <dl class="chessboard-dl">
            <dt>Subject</dt><dd>${esc(claim.subject)}</dd>
            <dt>Mechanism</dt><dd>${esc(claim.mechanism)}</dd>
            <dt>Actor</dt><dd>${esc(actorName(ws, claim.actorRef))}</dd>
            <dt>Asset</dt><dd>${esc(claim.asset)}</dd>
            <dt>Control point</dt><dd>${esc(controlName(ws, claim.controlPointRef))}</dd>
            <dt>Benefits</dt><dd>${inlineList(claim.beneficiaries)}</dd>
            <dt>Disadvantages</dt><dd>${inlineList(claim.disadvantaged)}</dd>
            <dt>Required conditions</dt><dd>${listItems(claim.conditions)}</dd>
            <dt>Time horizon</dt><dd>${words(claim.timeHorizon)}</dd>
            <dt>Falsifier</dt><dd>${esc(claim.falsifier)}</dd>
            <dt>Ledger state</dt><dd>${words(claim.status)} · confidence ${words(claim.confidence)} · contradiction ${words(claim.contradictionStatus)}</dd>
            <dt>As of</dt><dd>${esc(formatDate(claim.asOf))}</dd>
            <dt>Resolution</dt><dd>${esc(textOrUnknown(claim.resolution))}</dd>
          </dl>
          <div class="chessboard-evidence-columns">
            <div class="chessboard-evidence-column"><h4>Supporting evidence</h4>${sourceCards(ws, claim.evidenceRefs, 'No supporting evidence is linked. The claim is not evidenced.')}</div>
            <div class="chessboard-evidence-column"><h4>Counterevidence</h4>${sourceCards(ws, claim.counterEvidenceRefs, 'No counterevidence is linked. Absence of counterevidence is not support.')}</div>
          </div>
        </article>` : '<p class="empty">No strategic claim is available to trace.</p>'}
      </div>
    </section>`;
  }

  function renderSourceRegister(ws) {
    return `<section class="panel chessboard-section" aria-labelledby="source-register-title">
      <details><summary><strong id="source-register-title">Source register</strong> — ${ws.sourceRecords.length} records</summary>
        <p class="small">Status, verification date, eligibility, and visibility are shown as recorded. A linked URL does not independently prove a claim.</p>
        <div class="chessboard-card-grid">${ws.sourceRecords.map(item => sourceCard(ws, item.sourceId)).join('') || '<p class="empty">No source records exist.</p>'}</div>
      </details>
    </section>`;
  }

  function renderLoaded(ws, summary) {
    const authority = ws.selectionAuthority;
    const provisional = authority.state !== 'AUTHORITATIVE_ACTIVE_VENTURE';
    const discrepancyCount = authority.discrepancies?.length || 0;
    root.innerHTML = `
      <section class="panel chessboard-hero">
        <div class="chessboard-hero__row">
          <div>
            <div class="eyebrow">Chessboard · market structure × competitive response</div>
            <h1>${esc(ws.ventureName)}</h1>
            <p><strong>${esc(ws.canonicalIdeaId)}</strong> · snapshot ${esc(ws.snapshot.snapshotId)} · research cutoff ${esc(formatDate(ws.snapshot.researchCutoff))}</p>
          </div>
          <span class="chip chessboard-privacy-chip">Browser-local private copy</span>
        </div>
        <p class="chessboard-callout ${provisional ? 'chessboard-callout--warning' : ''}"><strong>${provisional ? 'Provisional, non-authoritative analysis target.' : 'Authoritative selection recorded.'}</strong> ${esc(authority.rationale)} Basis: ${words(authority.analysisTargetBasis)}. ${discrepancyCount ? `${discrepancyCount} selection discrepancy record(s) remain preserved.` : 'No selection discrepancy is recorded.'}</p>
      </section>
      ${notice ? `<div class="notice" id="chessboardNotice" role="alert" tabindex="-1" data-error="${noticeIsError}">${esc(notice)}</div>` : ''}
      <div id="chessboardStatus" class="sr-only" role="status" aria-live="polite"></div>
      ${toolbar(ws, summary)}
      <section class="chessboard-summary-grid" aria-label="Workspace contents">
        ${summaryCard('Market frames', summary.markets, 'Alternative boundaries retained')}
        ${summaryCard('Actors', summary.actors, 'Companies and non-company actors')}
        ${summaryCard('Value-chain layers', summary.layers, 'Ordered creation/capture positions')}
        ${summaryCard('Control points', summary.controlPoints, 'Mechanisms, not ownership labels')}
        ${summaryCard('Dependencies', summary.dependencies, 'Provider access and switching')}
        ${summaryCard('Response paths', summary.responses, 'Ability + incentive + constraint')}
        ${summaryCard('Strategic claims', summary.claims, `${summary.claimsWithCounterEvidence} include counterevidence`)}
        ${summaryCard('Open research gaps', summary.openResearchGaps, 'Explicit unknowns remain open')}
      </section>
      ${renderStrategicBrief(ws)}
      ${renderMarketDefinitions(ws)}
      ${renderValueChain(ws)}
      ${renderActorsAndEdges(ws)}
      ${renderSubstitutes(ws)}
      ${renderStructuralMatrices(ws)}
      ${renderDependencies(ws)}
      ${renderResponses(ws)}
      ${renderMoats(ws)}
      ${renderAntiMoatsAndCommoditization(ws)}
      ${renderTimeline(ws)}
      ${renderResearchQueue(ws)}
      ${renderContradictions(ws)}
      ${renderClaimTrace(ws)}
      ${renderSourceRegister(ws)}
      <section class="panel chessboard-section">
        <h2>Method boundary</h2>
        <p>${esc(ws.legacyScoreAudit.notes)}</p>
        <p><strong>${words(ws.legacyScoreAudit.status)}</strong> · ranking mutation authorized: no · methodology change: no.</p>
      </section>`;
    bindHandlers(ws, summary);
  }

  function render() {
    const ws = store.getWorkspace();
    const summary = store.getSummary();
    if (summary.empty) renderEmpty(ws, summary);
    else renderLoaded(ws, summary);
  }

  function report(message, isError = false) {
    notice = message;
    noticeIsError = isError;
  }

  function finishAction(message, isError = false, focusNotice = true) {
    report(message, isError);
    render();
    const status = document.getElementById('chessboardStatus');
    if (status) status.textContent = `${isError ? 'Error: ' : ''}${message}`;
    if (focusNotice) document.getElementById('chessboardNotice')?.focus({ preventScroll: true });
  }

  function bindHandlers(ws, summary) {
    document.querySelectorAll('#importChessboard').forEach(input => input.addEventListener('change', async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!summary.empty && !window.confirm('Replace the private Chessboard workspace in this browser? The current workspace can be restored once during this session.')) {
        event.target.value = '';
        return;
      }
      try {
        store.importJson(await file.text());
        selectedClaimId = null;
        viewMarketId = '';
        selectedThreatActorRef = '';
        finishAction('Private Chessboard workspace imported and validated. The analysis target remains provisional unless its recorded authority says otherwise.');
      } catch (error) {
        finishAction(`Import rejected; the prior workspace was preserved: ${error.message}`, true);
      }
    }));

    document.getElementById('exportChessboard')?.addEventListener('click', () => {
      try {
        const blob = new Blob([store.exportJson()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${ws.workspaceId}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
        finishAction('Private Chessboard export created. It is unencrypted; handle it as private strategy data.', false, false);
      } catch (error) {
        finishAction(`Export failed: ${error.message}`, true);
      }
    });

    document.getElementById('rollbackChessboard')?.addEventListener('click', () => {
      if (!window.confirm('Restore the workspace that preceded the latest import or reset in this session?')) return;
      try {
        store.rollback();
        selectedClaimId = null;
        viewMarketId = '';
        selectedThreatActorRef = '';
        finishAction('Previous in-session Chessboard workspace restored.');
      } catch (error) {
        finishAction(`Rollback failed: ${error.message}`, true);
      }
    });

    document.getElementById('resetChessboard')?.addEventListener('click', () => {
      if (!window.confirm('Delete the Chessboard workspace stored in this browser? Export first if you need a durable backup.')) return;
      try {
        store.reset();
        selectedClaimId = null;
        viewMarketId = '';
        selectedThreatActorRef = '';
        finishAction('Local Chessboard workspace reset. The removed workspace can be restored once during this session.');
      } catch (error) {
        finishAction(`Reset failed: ${error.message}`, true);
      }
    });

    document.getElementById('marketView')?.addEventListener('change', event => {
      viewMarketId = event.currentTarget.value;
      render();
      document.getElementById('ecosystem-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.getElementById('threatActorView')?.addEventListener('change', event => {
      selectedThreatActorRef = event.currentTarget.value;
      render();
      document.getElementById('responses-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.querySelectorAll('[data-claim-id]').forEach(button => button.addEventListener('click', () => {
      selectedClaimId = button.dataset.claimId;
      render();
      document.getElementById('activeClaimTitle')?.focus({ preventScroll: true });
    }));
  }

  function initPageChrome() {
    let theme = 'light';
    try { theme = localStorage.getItem('va-theme') || 'light'; } catch (_error) { /* local theme remains default */ }
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
    const themeButton = document.getElementById('themeBtn');
    const syncThemeButton = () => {
      if (!themeButton) return;
      const dark = document.documentElement.dataset.theme === 'dark';
      themeButton.textContent = dark ? '☀' : '☾';
      themeButton.setAttribute('aria-label', dark ? 'Use light mode' : 'Use dark mode');
    };
    themeButton?.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('va-theme', next); } catch (_error) { /* theme persistence is optional */ }
      syncThemeButton();
    });
    syncThemeButton();

    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navlinks');
    navToggle?.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navLinks?.classList.toggle('open', !expanded);
    });
  }

  initPageChrome();
  render();
}

if (typeof window !== 'undefined') window.initChessboardLab = initChessboardLab;
if (typeof module !== 'undefined' && module.exports) module.exports = { initChessboardLab };
