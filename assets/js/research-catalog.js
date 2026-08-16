(function () {
  'use strict';

  const nodes = {
    search: document.getElementById('proposalSearch'),
    round: document.getElementById('roundFilter'),
    relation: document.getElementById('relationFilter'),
    family: document.getElementById('familyFilter'),
    clear: document.getElementById('clearCatalogFilters'),
    list: document.getElementById('proposalFamilies'),
    status: document.getElementById('catalogStatus'),
    total: document.getElementById('proposalTotal'),
    rounds: document.getElementById('roundTotal'),
    visible: document.getElementById('visibleTotal')
  };
  if (!nodes.list) return;

  let catalog = null;

  function addOption(select, value, label) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }

  function cardFor(proposal) {
    const article = document.createElement('article');
    article.className = 'proposal-card';
    article.dataset.proposalId = proposal.id;

    const head = document.createElement('div');
    head.className = 'proposal-card-head';
    const title = document.createElement('h3');
    title.textContent = proposal.name;
    const badge = document.createElement('span');
    badge.className = `proposal-relation relation-${proposal.relation.toLowerCase().replaceAll('_', '-')}`;
    badge.textContent = proposal.relationLabel;
    head.append(title, badge);

    const meta = document.createElement('p');
    meta.className = 'proposal-meta';
    meta.textContent = `${proposal.roundTitle} · source row ${proposal.sourceOrdinal}`;

    const decision = document.createElement('p');
    decision.className = 'proposal-decision';
    const decisionLabel = document.createElement('strong');
    decisionLabel.textContent = 'Research decision: ';
    decision.append(decisionLabel, document.createTextNode(proposal.decision));

    article.append(head, meta, decision);

    if (proposal.adjacency) {
      const adjacency = document.createElement('p');
      adjacency.className = 'proposal-adjacency';
      const label = document.createElement('strong');
      label.textContent = 'Related context: ';
      adjacency.append(label, document.createTextNode(proposal.adjacency));
      article.appendChild(adjacency);
    }

    const foot = document.createElement('div');
    foot.className = 'proposal-foot';
    if (proposal.provisionalAnalystScore) {
      const score = document.createElement('span');
      score.textContent = `Provisional supplied score: ${proposal.provisionalAnalystScore} · not ranking eligible`;
      foot.appendChild(score);
    } else {
      const score = document.createElement('span');
      score.textContent = 'No supplied score recorded in the reconciliation table';
      foot.appendChild(score);
    }
    for (const ideaId of proposal.canonicalIdeaRefs) {
      const link = document.createElement('a');
      link.href = `./idea.html?id=${encodeURIComponent(ideaId)}`;
      link.textContent = ideaId;
      link.setAttribute('aria-label', `Open canonical ${ideaId}`);
      foot.appendChild(link);
    }
    article.appendChild(foot);
    return article;
  }

  function render() {
    if (!catalog) return;
    const query = nodes.search.value.trim().toLocaleLowerCase();
    const filtered = catalog.proposals.filter((proposal) => {
      const searchable = [proposal.name, proposal.decision, proposal.adjacency, proposal.roundTitle, proposal.familyLabel].filter(Boolean).join(' ').toLocaleLowerCase();
      return (!query || searchable.includes(query)) &&
        (!nodes.round.value || proposal.roundId === nodes.round.value) &&
        (!nodes.relation.value || proposal.relation === nodes.relation.value) &&
        (!nodes.family.value || proposal.familyId === nodes.family.value);
    });

    nodes.list.replaceChildren();
    const grouped = new Map();
    for (const proposal of filtered) {
      if (!grouped.has(proposal.familyId)) grouped.set(proposal.familyId, []);
      grouped.get(proposal.familyId).push(proposal);
    }
    const ordered = [...grouped.entries()].sort((a, b) => a[1][0].familyLabel.localeCompare(b[1][0].familyLabel));
    for (const [, proposals] of ordered) {
      const section = document.createElement('section');
      section.className = 'proposal-family';
      const heading = document.createElement('h2');
      heading.textContent = proposals[0].familyLabel;
      const count = document.createElement('span');
      count.textContent = `${proposals.length} shown`;
      heading.appendChild(count);
      const grid = document.createElement('div');
      grid.className = 'proposal-grid';
      proposals.forEach((proposal) => grid.appendChild(cardFor(proposal)));
      section.append(heading, grid);
      nodes.list.appendChild(section);
    }
    nodes.visible.textContent = String(filtered.length);
    nodes.status.textContent = filtered.length
      ? `Showing ${filtered.length} of ${catalog.proposalCount} proposals in ${ordered.length} similarity families.`
      : 'No proposals match these filters. Clear one or more filters to restore the catalog.';
  }

  async function init() {
    try {
      const response = await fetch('../data/research-proposal-catalog.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      catalog = await response.json();
      if (!Array.isArray(catalog.proposals) || catalog.proposals.length !== catalog.proposalCount) {
        throw new Error('catalog count contract failed');
      }
      nodes.total.textContent = String(catalog.proposalCount);
      nodes.rounds.textContent = String(catalog.roundCount);
      catalog.rounds.forEach((round) => addOption(nodes.round, round.id, `${round.title} (${round.proposalCount})`));
      Object.entries(catalog.relationCounts).forEach(([relation, count]) => {
        const match = catalog.proposals.find((proposal) => proposal.relation === relation);
        addOption(nodes.relation, relation, `${match.relationLabel} (${count})`);
      });
      const families = [...new Map(catalog.proposals.map((proposal) => [proposal.familyId, proposal.familyLabel])).entries()]
        .sort((a, b) => a[1].localeCompare(b[1]));
      families.forEach(([id, label]) => addOption(nodes.family, id, `${label} (${catalog.familyCounts[id]})`));
      [nodes.search, nodes.round, nodes.relation, nodes.family].forEach((node) => node.addEventListener('input', render));
      nodes.clear.addEventListener('click', () => {
        nodes.search.value = '';
        nodes.round.value = '';
        nodes.relation.value = '';
        nodes.family.value = '';
        render();
        nodes.search.focus();
      });
      render();
    } catch (error) {
      nodes.status.textContent = `The proposal catalog could not be loaded: ${error.message}`;
      nodes.status.classList.add('error');
    }
  }

  init();
})();
