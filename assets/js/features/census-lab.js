/**
 * census-lab.js
 * CENSUS Lab UI Controller
 * Implements the interactive Statistical Funnel for TAM/SAM/SOM calculation.
 */
document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'va_census_funnel';
    const defaultState = {
        unitDef: 'Enterprise Seats',
        universe: 1000000,
        eligibilityPct: 40,
        reachPct: 20,
        penetrationPct: 5,
        capturePct: 5,
        acv: 12000,
        ltv: 50000
    };

    let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState;

    const inputs = {
        unitDef: document.getElementById('unit-def'),
        universe: document.getElementById('funnel-universe'),
        eligibilityPct: document.getElementById('funnel-eligibility-pct'),
        reachPct: document.getElementById('funnel-reach-pct'),
        penetrationPct: document.getElementById('funnel-penetration-pct'),
        capturePct: document.getElementById('funnel-capture-pct'),
        acv: document.getElementById('unit-acv'),
        ltv: document.getElementById('unit-ltv')
    };

    const outputs = {
        universe: document.getElementById('out-universe'),
        tam: document.getElementById('out-tam'),
        sam: document.getElementById('out-sam'),
        som: document.getElementById('out-som'),
        tamVal: document.getElementById('out-tam-val'),
        samVal: document.getElementById('out-sam-val'),
        somVal: document.getElementById('out-som-val'),
        valElig: document.getElementById('val-eligibility'),
        valReach: document.getElementById('val-reach'),
        valPenetration: document.getElementById('val-penetration'),
        valCapture: document.getElementById('val-capture')
    };

    // Helper to format numbers
    function formatNum(num) {
        if(num >= 1000000) return (num/1000000).toFixed(1) + 'M';
        if(num >= 1000) return (num/1000).toFixed(1) + 'K';
        return Math.floor(num).toLocaleString();
    }

    function formatMoney(num) {
        if(num >= 1000000000) return '$' + (num/1000000000).toFixed(2) + 'B';
        if(num >= 1000000) return '$' + (num/1000000).toFixed(2) + 'M';
        if(num >= 1000) return '$' + (num/1000).toFixed(0) + 'K';
        return '$' + Math.floor(num).toLocaleString();
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function updateStateFromInputs() {
        if (inputs.unitDef) state.unitDef = inputs.unitDef.value;
        if (inputs.universe) state.universe = Number(inputs.universe.value);
        if (inputs.eligibilityPct) state.eligibilityPct = Number(inputs.eligibilityPct.value);
        if (inputs.reachPct) state.reachPct = Number(inputs.reachPct.value);
        if (inputs.penetrationPct) state.penetrationPct = Number(inputs.penetrationPct.value);
        if (inputs.capturePct) state.capturePct = Number(inputs.capturePct.value);
        if (inputs.acv) state.acv = Number(inputs.acv.value);
        if (inputs.ltv) state.ltv = Number(inputs.ltv.value);
    }

    function syncInputsToState() {
        if (inputs.unitDef) inputs.unitDef.value = state.unitDef;
        if (inputs.universe) inputs.universe.value = state.universe;
        if (inputs.eligibilityPct) inputs.eligibilityPct.value = state.eligibilityPct;
        if (inputs.reachPct) inputs.reachPct.value = state.reachPct;
        if (inputs.penetrationPct) inputs.penetrationPct.value = state.penetrationPct;
        if (inputs.capturePct) inputs.capturePct.value = state.capturePct;
        if (inputs.acv) inputs.acv.value = state.acv;
        if (inputs.ltv) inputs.ltv.value = state.ltv;
    }

    function render() {
        if (outputs.valElig) outputs.valElig.textContent = state.eligibilityPct + '%';
        if (outputs.valReach) outputs.valReach.textContent = state.reachPct + '%';
        if (outputs.valPenetration) outputs.valPenetration.textContent = state.penetrationPct + '%';
        if (outputs.valCapture) outputs.valCapture.textContent = state.capturePct + '%';

        const eligible = state.universe * (state.eligibilityPct / 100);
        const reachable = eligible * (state.reachPct / 100);
        // Penetration is out of the reachable SAM. Capture is of the penetrated SAM?
        // Let's just combine penetration and capture as successive funnel layers.
        const obtainable = reachable * (state.penetrationPct / 100) * (state.capturePct / 100);

        if (outputs.universe) outputs.universe.textContent = formatNum(state.universe);
        if (outputs.tam) outputs.tam.textContent = formatNum(eligible);
        if (outputs.sam) outputs.sam.textContent = formatNum(reachable);
        if (outputs.som) outputs.som.textContent = formatNum(obtainable);

        if (outputs.tamVal) outputs.tamVal.textContent = formatMoney(eligible * state.acv);
        if (outputs.samVal) outputs.samVal.textContent = formatMoney(reachable * state.acv);
        if (outputs.somVal) outputs.somVal.textContent = formatMoney(obtainable * state.acv);
    }

    // Attach event listeners
    Object.values(inputs).forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                updateStateFromInputs();
                render();
            });
            input.addEventListener('change', () => {
                updateStateFromInputs();
                saveState();
            });
        }
    });

    // Handle export and import logic if buttons exist
    const btnExport = document.getElementById('btn-export');
    const btnImport = document.getElementById('btn-import');
    
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
            const dl = document.createElement('a');
            dl.setAttribute("href", dataStr);
            dl.setAttribute("download", "ventura_census_funnel_export.json");
            document.body.appendChild(dl);
            dl.click();
            dl.remove();
        });
    }

    if (btnImport) {
        btnImport.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (imported && imported.universe !== undefined) {
                        state = { ...defaultState, ...imported };
                        syncInputsToState();
                        saveState();
                        render();
                    } else {
                        alert("Invalid file format.");
                    }
                } catch(err) {
                    alert("Error parsing JSON.");
                }
            };
            reader.readAsText(file);
        });
    }

    // Init
    syncInputsToState();
    render();
});
