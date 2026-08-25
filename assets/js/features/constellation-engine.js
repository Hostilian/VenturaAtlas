/**
 * VenturaAtlas Constellation Engine — Pure Deterministic Organizational,
 * Role Ownership, Decision Rights, Delegation, and Operating Cadence Intelligence.
 *
 * Core Principle: Early-stage organizations scale by clarity, capability, and focus,
 * not corporate HR bureaucracy or headcount inflation. Person != Role.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VAConstellationEngine = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Evaluates role clarity and structural integrity.
   */
  function evaluateRoleClarity(role) {
    if (!role || typeof role !== 'object') {
      throw new Error('Invalid role object');
    }
    const hasPurpose = Boolean(role.purpose && role.purpose.trim().length > 10);
    const outcomesCount = Array.isArray(role.accountableOutcomes) ? role.accountableOutcomes.length : 0;
    const respCount = Array.isArray(role.recurringResponsibilities) ? role.recurringResponsibilities.length : 0;
    const capsCount = Array.isArray(role.requiredCapabilities) ? role.requiredCapabilities.length : 0;

    const isClear = hasPurpose && outcomesCount > 0 && respCount > 0 && capsCount > 0;
    const delegatableResps = (role.recurringResponsibilities || []).filter(r => r.isDelegatable);

    return {
      roleId: role.roleId,
      title: role.title,
      isClear,
      outcomesCount,
      responsibilitiesCount: respCount,
      delegatableCount: delegatableResps.length,
      delegatableRatio: respCount > 0 ? Math.round((delegatableResps.length / respCount) * 100) / 100 : 0,
      hasAssignedOwner: Boolean(role.currentOwnerId),
      capacityHours: Number(role.weeklyHoursCapacityRequired || 0)
    };
  }

  /**
   * Detects organizational bottlenecks, overloads, and unowned responsibilities.
   */
  function detectBottlenecks(workspace) {
    if (!workspace || !Array.isArray(workspace.people) || !Array.isArray(workspace.roles)) {
      throw new Error('Invalid workspace object');
    }

    const people = workspace.people;
    const roles = workspace.roles;
    const decisions = workspace.decisionRights || [];

    const unownedRoles = roles.filter(r => r.status === 'ACTIVE_VACANT' || !r.currentOwnerId);
    
    // Check person overload and capacity allocation
    const personDiagnostics = people.map(p => {
      const assignedRoles = roles.filter(r => p.assignedRoleIds?.includes(r.roleId));
      const totalAllocatedPercent = (p.roleAllocationsPercent || []).reduce((sum, a) => sum + Number(a.allocationPercent || 0), 0);
      const totalHoursDemanded = assignedRoles.reduce((sum, r) => sum + Number(r.weeklyHoursCapacityRequired || 0), 0);
      const isOverallocated = totalAllocatedPercent > 100 || totalHoursDemanded > (p.totalWeeklyCapacityHours || 40);

      // Context switching index: number of distinct role domains held
      const contextSwitchingScore = assignedRoles.length > 3 ? 'HIGH_FRAGMENTATION' : (assignedRoles.length > 1 ? 'MODERATE' : 'FOCUSED');

      return {
        personId: p.personId,
        displayName: p.displayName,
        relationship: p.relationship,
        roleCount: assignedRoles.length,
        totalAllocatedPercent,
        totalHoursDemanded,
        capacityHours: p.totalWeeklyCapacityHours || 40,
        isOverallocated,
        contextSwitchingScore
      };
    });

    // Detect Decision Bottlenecks (Founder deciding > 70% of decision classes)
    const founder = people.find(p => p.relationship === 'FOUNDER' || p.relationship === 'CO_FOUNDER');
    const founderRoleId = founder?.assignedRoleIds?.[0];
    const decisionsDecidedByFounder = decisions.filter(d => d.deciderRoleId === founderRoleId || d.deciderRoleId === 'role-founder');
    const founderApprovalRatio = decisions.length > 0
      ? Math.round((decisionsDecidedByFounder.length / decisions.length) * 100) / 100
      : 0;

    const approvalBottleneckSeverity = founderApprovalRatio >= 0.75
      ? 'CRITICAL_CENTRALIZATION'
      : (founderApprovalRatio >= 0.5 ? 'MODERATE_CENTRALIZATION' : 'DISTRIBUTED_AUTHORITY');

    // Detect decision authority collisions (two exclusive deciders on one scope)
    const decisionCollisions = [];
    const scopeMap = {};
    for (const d of decisions) {
      if (scopeMap[d.scope]) {
        decisionCollisions.push({
          scope: d.scope,
          decider1: scopeMap[d.scope].deciderRoleId,
          decider2: d.deciderRoleId
        });
      } else {
        scopeMap[d.scope] = d;
      }
    }

    return {
      unownedRolesCount: unownedRoles.length,
      unownedRoles: unownedRoles.map(r => ({ roleId: r.roleId, title: r.title, purpose: r.purpose })),
      overallocatedPeople: personDiagnostics.filter(p => p.isOverallocated),
      personDiagnostics,
      founderApprovalRatio,
      approvalBottleneckSeverity,
      decisionCollisions,
      hasDecisionCollision: decisionCollisions.length > 0
    };
  }

  /**
   * Evaluates capability coverage across active venture requirements.
   */
  function evaluateCapabilityCoverage(requiredCapabilityIds, people, capabilityOntology) {
    const required = Array.isArray(requiredCapabilityIds) ? requiredCapabilityIds : [];
    const team = Array.isArray(people) ? people : [];
    const ontology = Array.isArray(capabilityOntology) ? capabilityOntology : [];

    const possessedMap = {};
    for (const p of team) {
      for (const capId of (p.capabilitiesPossessed || [])) {
        possessedMap[capId] = (possessedMap[capId] || []).concat(p.displayName);
      }
    }

    const coverageReport = required.map(capId => {
      const capMeta = ontology.find(c => c.capabilityId === capId) || { capabilityId: capId, name: capId, domain: 'UNKNOWN' };
      const holders = possessedMap[capId] || [];
      let status = 'UNCOVERED_MISSING';
      if (holders.length >= 2) status = 'RESILIENT_COVERED';
      else if (holders.length === 1) status = 'SINGLE_POINT_OF_FAILURE';

      return {
        capabilityId: capId,
        name: capMeta.name,
        domain: capMeta.domain,
        status,
        holders,
        isAiAutomatable: capMeta.isAiAutomatable || false
      };
    });

    const missing = coverageReport.filter(c => c.status === 'UNCOVERED_MISSING');
    const singlePoints = coverageReport.filter(c => c.status === 'SINGLE_POINT_OF_FAILURE');
    const covered = coverageReport.filter(c => c.status === 'RESILIENT_COVERED');

    return {
      totalRequired: required.length,
      coveredCount: covered.length,
      singlePointCount: singlePoints.length,
      missingCount: missing.length,
      coverageRatio: required.length > 0 ? Math.round(((covered.length + singlePoints.length) / required.length) * 100) / 100 : 1.0,
      missingCapabilities: missing,
      singlePointsOfFailure: singlePoints
    };
  }

  /**
   * Evaluates founder load, comparative advantage, and delegation opportunities.
   */
  function evaluateFounderLoad(founderPerson, roles, decisionRights) {
    if (!founderPerson) return null;
    const assignedRoles = (roles || []).filter(r => founderPerson.assignedRoleIds?.includes(r.roleId));
    
    let totalRecurringHours = 0;
    let delegatableHours = 0;
    const delegatableItems = [];

    for (const r of assignedRoles) {
      const resps = r.recurringResponsibilities || [];
      for (const resp of resps) {
        // Approximate responsibility time slice
        const estimatedHours = Math.round(Number(r.weeklyHoursCapacityRequired || 10) / Math.max(1, resps.length));
        totalRecurringHours += estimatedHours;
        if (resp.isDelegatable) {
          delegatableHours += estimatedHours;
          delegatableItems.push({
            responsibilityId: resp.responsibilityId,
            roleId: r.roleId,
            roleTitle: r.title,
            title: resp.title,
            cadence: resp.cadence,
            estimatedHours,
            sopRef: resp.sopRef,
            delegationDifficulty: resp.delegationDifficulty || 'MEDIUM'
          });
        }
      }
    }

    const delegatablePercentage = totalRecurringHours > 0
      ? Math.round((delegatableHours / totalRecurringHours) * 100)
      : 0;

    return {
      founderId: founderPerson.personId,
      displayName: founderPerson.displayName,
      rolesHeldCount: assignedRoles.length,
      totalRecurringHours,
      delegatableHours,
      delegatablePercentage,
      delegationReadiness: delegatablePercentage >= 30 ? 'HIGH_DELEGATION_POTENTIAL' : 'FOUNDER_CORE_CONCENTRATED',
      delegatableItems
    };
  }

  /**
   * Generates a structured operational delegation packet.
   */
  function generateDelegationPacket(params) {
    const {
      delegationId,
      title,
      delegatorRoleId,
      delegateeRoleId,
      intendedOutcome,
      operationalContext,
      decisionAuthorityGranted,
      operatingConstraints,
      inputsRequired,
      successCriteria,
      sopRef,
      escalationRule,
      checkInCadence
    } = params;

    if (!title || !delegatorRoleId || !delegateeRoleId || !intendedOutcome) {
      throw new Error('Title, delegator, delegatee, and intended outcome are required for delegation packet');
    }

    return {
      schemaVersion: '1.0.0',
      delegationId: delegationId || `del-${Date.now()}`,
      title,
      delegatorRoleId,
      delegateeRoleId,
      intendedOutcome,
      operationalContext: operationalContext || 'Operational transfer to increase founder leverage.',
      decisionAuthorityGranted: decisionAuthorityGranted || 'DECIDE_AND_INFORM',
      operatingConstraints: Array.isArray(operatingConstraints) ? operatingConstraints : ['Budget <= €500', 'No security boundary changes'],
      inputsRequired: Array.isArray(inputsRequired) ? inputsRequired : [],
      successCriteria: Array.isArray(successCriteria) ? successCriteria : ['Measurable delivery without founder rework'],
      sopRef: sopRef || null,
      escalationRule: escalationRule || 'Escalate if budget exceeds threshold or delivery date slips >48h',
      checkInCadence: checkInCadence || 'WEEKLY_REVIEW',
      status: 'ACTIVE_DELEGATED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Analyzes organizational knowledge domains and identifies Bus Factor = 1 vulnerabilities.
   */
  function analyzeKnowledgeRisk(knowledgeDomains, people) {
    const domains = Array.isArray(knowledgeDomains) ? knowledgeDomains : [];
    const team = Array.isArray(people) ? people : [];

    const riskItems = domains.map(d => {
      const primary = team.find(p => p.personId === d.primaryOwnerPersonId);
      const backup = team.find(p => p.personId === d.backupOwnerPersonId);
      const isBusFactorOne = !backup && d.criticality !== 'LOW';
      const isDocumented = Boolean(d.hasVerifiedRunbook && d.runbookArtifactRef);

      let vulnerability = 'LOW_RISK';
      if (isBusFactorOne && !isDocumented && (d.criticality === 'CRITICAL' || d.criticality === 'HIGH')) {
        vulnerability = 'CRITICAL_VULNERABILITY';
      } else if (isBusFactorOne && isDocumented) {
        vulnerability = 'MODERATE_RUNBOOK_BACKED';
      }

      return {
        domainId: d.domainId,
        name: d.name,
        criticality: d.criticality,
        primaryOwner: primary?.displayName || d.primaryOwnerPersonId,
        backupOwner: backup?.displayName || null,
        hasVerifiedRunbook: isDocumented,
        runbookRef: d.runbookArtifactRef,
        isBusFactorOne,
        vulnerability
      };
    });

    const criticalRisks = riskItems.filter(r => r.vulnerability === 'CRITICAL_VULNERABILITY');
    const continuityScore = domains.length > 0
      ? Math.round(((domains.length - criticalRisks.length) / domains.length) * 100)
      : 100;

    return {
      domainsCount: domains.length,
      criticalVulnerabilitiesCount: criticalRisks.length,
      continuityScore,
      continuityGrade: continuityScore >= 85 ? 'RESILIENT' : (continuityScore >= 60 ? 'VULNERABLE' : 'CRITICAL_BUS_FACTOR'),
      riskItems
    };
  }

  /**
   * Evaluates evidence-based hiring cases and tests alternatives before recruiting.
   */
  function evaluateHiringNeed(hiringCase, ventureContext) {
    if (!hiringCase || typeof hiringCase !== 'object') {
      throw new Error('Invalid hiring case object');
    }

    const ctx = ventureContext || {};
    const flags = [];
    const recommendations = [];

    // Check premature hiring patterns
    if (hiringCase.proposedRoleTitle?.toLowerCase().includes('sales')) {
      if (!ctx.hasRepeatableSalesProcess && !ctx.hasObservedPaidCustomers) {
        flags.push('PREMATURE_SALES_HIRE: Founder has not yet established a repeatable sales motion or WTP proof in Mercury. A salesperson cannot discover the sales process.');
      }
    }

    if (hiringCase.proposedRoleTitle?.toLowerCase().includes('coo')) {
      if ((ctx.teamSize || 1) <= 3) {
        flags.push('PREMATURE_EXECUTIVE: COO role in a <4 person team introduces management overhead before operational volume exists.');
      }
    }

    // Evaluate alternatives
    const preferredAlt = (hiringCase.evaluatedAlternatives || []).find(a => a.feasibility === 'PREFERRED');

    let verdict = 'PROCEED_WITH_HIRING_CASE';
    if (flags.length > 0) {
      verdict = 'CHALLENGE_ASSUMPTION_PREMATURE';
    } else if (preferredAlt && preferredAlt.alternativeType !== 'FULL_TIME_HIRE') {
      verdict = 'EXPLORE_NON_EMPLOYEE_ALTERNATIVE_FIRST';
      recommendations.push(`Consider ${preferredAlt.alternativeType.replace(/_/g, ' ')}: ${preferredAlt.rationale}`);
    }

    return {
      caseId: hiringCase.caseId,
      proposedRoleTitle: hiringCase.proposedRoleTitle,
      verdict,
      flags,
      recommendations,
      hasDemonstratedBottleneck: Boolean(hiringCase.evidenceOfBottleneck && hiringCase.evidenceOfBottleneck.length > 15),
      mustHaveCapabilities: hiringCase.mustHaveCapabilities || []
    };
  }

  /**
   * Audits meeting intelligence, ROI, and commitment continuity.
   */
  function analyzeMeetingContinuity(meetings) {
    const list = Array.isArray(meetings) ? meetings : [];

    let totalHumanMinutesConsumed = 0;
    let totalDecisions = 0;
    let totalCommitments = 0;
    const zeroOutputMeetings = [];
    const allCommitments = [];

    for (const m of list) {
      const participantsCount = Array.isArray(m.participantPersonIds) ? m.participantPersonIds.length : 1;
      const duration = Number(m.durationMinutes || 30);
      totalHumanMinutesConsumed += duration * participantsCount;

      const decs = Array.isArray(m.decisionsProduced) ? m.decisionsProduced : [];
      const comms = Array.isArray(m.commitmentsCreated) ? m.commitmentsCreated : [];

      totalDecisions += decs.length;
      totalCommitments += comms.length;

      for (const c of comms) {
        allCommitments.push({
          ...c,
          sourceMeetingId: m.meetingId,
          sourceMeetingTitle: m.title
        });
      }

      if (m.status !== 'CANCELLED_ASYNC_CONVERTED' && decs.length === 0 && comms.length === 0) {
        zeroOutputMeetings.push({
          meetingId: m.meetingId,
          title: m.title,
          durationMinutes: duration,
          humanMinutesWasted: duration * participantsCount
        });
      }
    }

    const openCommitments = allCommitments.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS');
    const fulfilledCommitments = allCommitments.filter(c => c.status === 'FULFILLED');
    const blockedCommitments = allCommitments.filter(c => c.status === 'BLOCKED');

    return {
      totalMeetingsAudited: list.length,
      totalHumanHoursConsumed: Math.round((totalHumanMinutesConsumed / 60) * 10) / 10,
      totalDecisionsProduced: totalDecisions,
      totalCommitmentsCreated: totalCommitments,
      zeroOutputMeetingsCount: zeroOutputMeetings.length,
      zeroOutputMeetings,
      commitmentsSummary: {
        total: allCommitments.length,
        open: openCommitments.length,
        fulfilled: fulfilledCommitments.length,
        blocked: blockedCommitments.length,
        fulfillmentRate: allCommitments.length > 0 ? Math.round((fulfilledCommitments.length / allCommitments.length) * 100) : 0
      },
      meetingBloatAlert: zeroOutputMeetings.length >= 2 ? 'HIGH_MEETING_BLOAT_DETECTED' : 'HEALTHY_MEETING_EFFICIENCY'
    };
  }

  /**
   * Recommends stage-appropriate operating cadence without corporate meeting bloat.
   */
  function evaluateOperatingCadence(companyStage, currentMeetings) {
    const stage = companyStage || 'SOLO_FOUNDER';
    const cadenceMap = {
      SOLO_FOUNDER: {
        maxWeeklyMeetingHours: 1.0,
        recommendedRituals: [
          'Daily 5-minute Execution Check (Self / Async)',
          'Weekly Milestone & Learning Review (Async 30-min)'
        ],
        avoidRituals: ['Daily syncs', 'Departmental reviews', 'Multi-person standups']
      },
      TWO_FOUNDERS: {
        maxWeeklyMeetingHours: 2.5,
        recommendedRituals: [
          'Weekly Operating & Customer Learning Review (60-min sync)',
          'Biweekly Strategy & Decision Council (45-min sync)',
          'Async Daily Blocker Check'
        ],
        avoidRituals: ['Separate sales/product meetings with only 2 people', 'Lengthy status presentations']
      },
      SMALL_CORE_TEAM: {
        maxWeeklyMeetingHours: 4.5,
        recommendedRituals: [
          'Weekly Operating Review (45-min)',
          'Weekly Customer Learning & Demo Sync (45-min)',
          'Biweekly Architecture & Security Gate (45-min)',
          'Async Daily Check-in'
        ],
        avoidRituals: ['Daily 30-min verbal standups', 'Ad-hoc unstructured meetings without pre-read inputs']
      },
      SCALING_FUNCTIONAL: {
        maxWeeklyMeetingHours: 8.0,
        recommendedRituals: [
          'Weekly Cross-Functional Alignment (60-min)',
          'Functional Team Reviews (45-min)',
          'Monthly Strategy & Capability Planning (90-min)'
        ],
        avoidRituals: ['All-hands status updates that can be written documents']
      }
    };

    const config = cadenceMap[stage] || cadenceMap.SOLO_FOUNDER;
    return {
      companyStage: stage,
      maxWeeklyMeetingHoursRecommended: config.maxWeeklyMeetingHours,
      recommendedRituals: config.recommendedRituals,
      avoidRituals: config.avoidRituals
    };
  }

  return {
    evaluateRoleClarity,
    detectBottlenecks,
    evaluateCapabilityCoverage,
    evaluateFounderLoad,
    generateDelegationPacket,
    analyzeKnowledgeRisk,
    evaluateHiringNeed,
    analyzeMeetingContinuity,
    evaluateOperatingCadence
  };
});
