/**
 * Venture Atlas OS — Real-Time Cloud Room Firebase Adapter (v3.0.0)
 * Provides seamless Anonymous Auth & Cloud Firestore synchronization
 * with offline persistence, presence, and zero-crash local fallback.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VAFirebase = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SYNC_STATUS = {
    LOCAL_ONLY: 'LOCAL_ONLY',       // Firebase is not configured; running pure local-first store
    CONNECTING: 'CONNECTING',       // Authenticating / connecting to Firestore
    SYNCED: 'SYNCED',               // Connected, real-time sync active
    SAVING: 'SAVING',               // Mutating remote Firestore documents
    OFFLINE: 'OFFLINE',             // Network disconnected; changes queued in local store
    ERROR: 'ERROR'                  // Remote permission or configuration error
  };

  class FirebaseAdapter {
    constructor() {
      this.status = SYNC_STATUS.LOCAL_ONLY;
      this.statusMessage = 'Local Decision Workspace (Private)';
      this.app = null;
      this.auth = null;
      this.db = null;
      this.activeRoomId = null;
      this.unsubscribers = [];
      this.isSyncingInward = false;
      this.statusListeners = new Set();
    }

    isConfigured() {
      const cfg = (typeof window !== 'undefined' && window.VA_CONFIG?.firebase) || null;
      return Boolean(cfg && cfg.apiKey && cfg.projectId);
    }

    getStatus() {
      return {
        status: this.status,
        message: this.statusMessage,
        isConfigured: this.isConfigured(),
        isLiveRoom: Boolean(this.activeRoomId && this.status === SYNC_STATUS.SYNCED)
      };
    }

    onStatusChange(cb) {
      if (typeof cb === 'function') {
        this.statusListeners.add(cb);
        cb(this.getStatus());
        return () => this.statusListeners.delete(cb);
      }
      return () => {};
    }

    _setStatus(status, message) {
      this.status = status;
      this.statusMessage = message;
      const payload = this.getStatus();
      this.statusListeners.forEach(cb => {
        try { cb(payload); } catch (e) { console.warn(e); }
      });
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        try {
          window.dispatchEvent(new CustomEvent('va:firebase:status', { detail: payload }));
        } catch (e) {}
      }
    }

    async init() {
      if (!this.isConfigured()) {
        this._setStatus(SYNC_STATUS.LOCAL_ONLY, 'Local-First Studio (Changes saved in browser)');
        return false;
      }

      if (typeof firebase === 'undefined') {
        console.info('[VAFirebase] Firebase SDK script not loaded. Running in local-first mode.');
        this._setStatus(SYNC_STATUS.LOCAL_ONLY, 'Local-First Studio (Firebase SDK unbundled)');
        return false;
      }

      try {
        this._setStatus(SYNC_STATUS.CONNECTING, 'Connecting to Cloud Room...');
        const config = window.VA_CONFIG.firebase;

        if (!firebase.apps.length) {
          this.app = firebase.initializeApp(config);
        } else {
          this.app = firebase.apps[0];
        }

        this.auth = firebase.auth();
        this.db = firebase.firestore();

        // Enable offline persistence if supported
        try {
          await this.db.enablePersistence({ synchronizeTabs: true });
        } catch (err) {
          if (err.code === 'failed-precondition') {
            console.warn('[VAFirebase] Multi-tab persistence failed-precondition.');
          } else if (err.code === 'unimplemented') {
            console.warn('[VAFirebase] Offline persistence not supported in this browser.');
          }
        }

        // Authenticate anonymously
        if (!this.auth.currentUser) {
          await this.auth.signInAnonymously();
        }

        const uid = this.auth.currentUser.uid;
        console.info(`[VAFirebase] Authenticated anonymously: ${uid}`);

        // Handle online / offline network events
        if (typeof window !== 'undefined') {
          window.addEventListener('online', () => {
            if (this.activeRoomId) this._setStatus(SYNC_STATUS.SYNCED, 'Synced with Cloud Room');
          });
          window.addEventListener('offline', () => {
            this._setStatus(SYNC_STATUS.OFFLINE, 'Offline — Changes saved locally in browser');
          });
        }

        return true;
      } catch (err) {
        console.error('[VAFirebase] Initialization error:', err);
        this._setStatus(SYNC_STATUS.ERROR, `Cloud sync unavailable (${err.message || 'Config error'}). Fallback to local.`);
        return false;
      }
    }

    async connectRoom(roomId, storeInstance) {
      if (!roomId || !storeInstance) return false;
      this.activeRoomId = roomId;

      const ready = await this.init();
      if (!ready || !this.db || !this.auth?.currentUser) {
        // Fall back to local room
        return false;
      }

      const uid = this.auth.currentUser.uid;
      const user = storeInstance.getUser();
      const roomRef = this.db.collection('rooms').doc(roomId);

      try {
        // Join or create room
        const roomDoc = await roomRef.get();
        if (!roomDoc.exists) {
          // Create room as owner
          await roomRef.set({
            id: roomId,
            name: storeInstance.getWorkspace()?.name || 'Shared Decision Room',
            ownerUid: uid,
            ownerName: user.displayName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }

        // Register member
        await roomRef.collection('members').doc(uid).set({
          uid: uid,
          displayName: user.displayName,
          color: user.color || 'hsl(210, 80%, 50%)',
          role: (roomDoc.exists && roomDoc.data()?.ownerUid === uid) ? 'owner' : 'member',
          joinedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Setup real-time listeners
        this._setupListeners(roomRef, storeInstance);
        this._setStatus(SYNC_STATUS.SYNCED, `Synchronized Cloud Room · ${roomId}`);
        return true;
      } catch (err) {
        console.error('[VAFirebase] Failed to connect to room:', err);
        this._setStatus(SYNC_STATUS.ERROR, `Cloud room connect failed (${err.message}). Using local store.`);
        return false;
      }
    }

    _setupListeners(roomRef, store) {
      // Clear any prior listeners
      this.unsubscribers.forEach(unsub => { try { unsub(); } catch (e) {} });
      this.unsubscribers = [];

      // 1. Shortlist listener
      const unsubShortlist = roomRef.collection('shortlist').onSnapshot(snap => {
        if (snap.empty && !store.getShortlist().length) return;
        const remoteItems = [];
        snap.forEach(doc => {
          remoteItems.push(doc.data());
        });
        if (remoteItems.length > 0) {
          this.isSyncingInward = true;
          const currentWs = store.getWorkspace();
          if (currentWs) {
            currentWs.shortlist = remoteItems.sort((a, b) => (a.rankOrder ?? 0) - (b.rankOrder ?? 0));
            store.setWorkspace(currentWs, false);
            store.emit('shortlistChanged', currentWs.shortlist);
          }
          this.isSyncingInward = false;
        }
      }, err => console.warn('[VAFirebase] Shortlist listener error:', err));
      this.unsubscribers.push(unsubShortlist);

      // 2. Notes listener
      const unsubNotes = roomRef.collection('notes').onSnapshot(snap => {
        const remoteNotes = [];
        snap.forEach(doc => {
          remoteNotes.push(doc.data());
        });
        if (remoteNotes.length > 0) {
          this.isSyncingInward = true;
          const currentWs = store.getWorkspace();
          if (currentWs) {
            currentWs.notes = remoteNotes;
            store.setWorkspace(currentWs, false);
            store.emit('notesChanged', currentWs.notes);
          }
          this.isSyncingInward = false;
        }
      }, err => console.warn('[VAFirebase] Notes listener error:', err));
      this.unsubscribers.push(unsubNotes);

      // 3. Scorecards listener
      const unsubScorecards = roomRef.collection('scorecards').onSnapshot(snap => {
        const remoteCards = [];
        snap.forEach(doc => {
          remoteCards.push(doc.data());
        });
        if (remoteCards.length > 0) {
          this.isSyncingInward = true;
          const currentWs = store.getWorkspace();
          if (currentWs) {
            currentWs.scorecards = remoteCards;
            store.setWorkspace(currentWs, false);
            store.emit('scorecardsChanged', currentWs.scorecards);
          }
          this.isSyncingInward = false;
        }
      }, err => console.warn('[VAFirebase] Scorecard listener error:', err));
      this.unsubscribers.push(unsubScorecards);

      // 4. Pairwise listener
      const unsubPairwise = roomRef.collection('pairwise').onSnapshot(snap => {
        const remotePair = [];
        snap.forEach(doc => {
          remotePair.push(doc.data());
        });
        if (remotePair.length > 0) {
          this.isSyncingInward = true;
          const currentWs = store.getWorkspace();
          if (currentWs) {
            currentWs.pairwise = remotePair;
            store.setWorkspace(currentWs, false);
            store.emit('pairwiseChanged', currentWs.pairwise);
          }
          this.isSyncingInward = false;
        }
      }, err => console.warn('[VAFirebase] Pairwise listener error:', err));
      this.unsubscribers.push(unsubPairwise);

      // 5. Variants listener
      const unsubVariants = roomRef.collection('variants').onSnapshot(snap => {
        const remoteVariants = [];
        snap.forEach(doc => {
          remoteVariants.push(doc.data());
        });
        if (remoteVariants.length > 0) {
          this.isSyncingInward = true;
          const currentWs = store.getWorkspace();
          if (currentWs) {
            currentWs.variants = remoteVariants;
            store.setWorkspace(currentWs, false);
            store.emit('variantsChanged', currentWs.variants);
          }
          this.isSyncingInward = false;
        }
      }, err => console.warn('[VAFirebase] Variants listener error:', err));
      this.unsubscribers.push(unsubVariants);

      // 6. Decision listener
      const unsubDecisions = roomRef.collection('decisions').doc('current').onSnapshot(doc => {
        if (doc.exists) {
          this.isSyncingInward = true;
          const currentWs = store.getWorkspace();
          if (currentWs) {
            currentWs.decision = doc.data();
            store.setWorkspace(currentWs, false);
            store.emit('decisionChanged', currentWs.decision);
          }
          this.isSyncingInward = false;
        }
      }, err => console.warn('[VAFirebase] Decision listener error:', err));
      this.unsubscribers.push(unsubDecisions);
    }

    async pushShortlistChange(items) {
      if (!this.activeRoomId || !this.db || this.isSyncingInward) return;
      try {
        const batch = this.db.batch();
        const col = this.db.collection('rooms').doc(this.activeRoomId).collection('shortlist');
        (items || []).forEach(item => {
          const docRef = col.doc(item.ideaId);
          batch.set(docRef, item, { merge: true });
        });
        await batch.commit();
      } catch (e) {
        console.warn('[VAFirebase] Failed to sync shortlist item:', e);
      }
    }

    async pushNote(note) {
      if (!this.activeRoomId || !this.db || this.isSyncingInward || !note?.id) return;
      try {
        await this.db
          .collection('rooms')
          .doc(this.activeRoomId)
          .collection('notes')
          .doc(note.id)
          .set(note, { merge: true });
      } catch (e) {
        console.warn('[VAFirebase] Failed to sync note:', e);
      }
    }

    async pushScorecard(scorecard) {
      if (!this.activeRoomId || !this.db || this.isSyncingInward || !scorecard?.id) return;
      try {
        await this.db
          .collection('rooms')
          .doc(this.activeRoomId)
          .collection('scorecards')
          .doc(scorecard.id)
          .set(scorecard, { merge: true });
      } catch (e) {
        console.warn('[VAFirebase] Failed to sync scorecard:', e);
      }
    }

    async pushPairwise(record) {
      if (!this.activeRoomId || !this.db || this.isSyncingInward || !record?.id) return;
      try {
        await this.db
          .collection('rooms')
          .doc(this.activeRoomId)
          .collection('pairwise')
          .doc(record.id)
          .set(record, { merge: true });
      } catch (e) {
        console.warn('[VAFirebase] Failed to sync pairwise:', e);
      }
    }

    async pushVariant(variant) {
      if (!this.activeRoomId || !this.db || this.isSyncingInward || !variant?.id) return;
      try {
        await this.db
          .collection('rooms')
          .doc(this.activeRoomId)
          .collection('variants')
          .doc(variant.id)
          .set(variant, { merge: true });
      } catch (e) {
        console.warn('[VAFirebase] Failed to sync variant:', e);
      }
    }

    async pushDecision(decision) {
      if (!this.activeRoomId || !this.db || this.isSyncingInward) return;
      try {
        const docRef = this.db.collection('rooms').doc(this.activeRoomId).collection('decisions').doc('current');
        if (decision) {
          await docRef.set(decision);
        } else {
          await docRef.delete();
        }
      } catch (e) {
        console.warn('[VAFirebase] Failed to sync decision:', e);
      }
    }

    disconnect() {
      this.unsubscribers.forEach(unsub => { try { unsub(); } catch (e) {} });
      this.unsubscribers = [];
      this.activeRoomId = null;
      this._setStatus(SYNC_STATUS.LOCAL_ONLY, 'Local-First Studio (Disconnected)');
    }
  }

  const adapterInstance = new FirebaseAdapter();

  return {
    FirebaseAdapter,
    adapter: adapterInstance,
    SYNC_STATUS
  };
}));
