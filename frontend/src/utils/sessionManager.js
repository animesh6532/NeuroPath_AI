/**
 * SessionManager
 * Centralized authority for managing, backing up, and logging all interview session mutations.
 * Serves as the Central Session Controller.
 */

import { interviewAPI } from "../api/endpoints";

class SessionManagerClass {
  constructor() {
    this.sessionId = null;
    this.mutationLogs = [];
    this.backendState = "CREATED"; // Tracks the last known backend session state
    this.initializationStatus = "IDLE"; // IDLE, RUNNING, SUCCESS, FAILED
    this.stateLogs = []; // Logs state transitions
    this._initializeFromStorage();
  }

  _initializeFromStorage() {
    try {
      this.sessionId = localStorage.getItem("interview_session_id") || null;
      this.logMutation(
        null,
        this.sessionId,
        "SessionManager Initialization",
        "System initialization reading from local storage backup"
      );
    } catch (err) {
      console.warn("[SessionManager] Failed to read initial storage:", err);
    }
  }

  logMutation(prevId, newId, componentName, reason) {
    const timestamp = new Date().toISOString();
    let callStack = "No stack trace available";
    try {
      const err = new Error();
      callStack = err.stack ? err.stack.split("\n").slice(2).join("\n") : "No stack trace available";
    } catch (e) {}

    const logEntry = {
      timestamp,
      previousSessionId: prevId,
      newSessionId: newId,
      callStack,
      componentName,
      reason,
    };

    this.mutationLogs.unshift(logEntry);
    
    if (this.mutationLogs.length > 100) {
      this.mutationLogs.pop();
    }

    console.log(
      `[SessionManager LOG] [${timestamp}] Mutation: "${prevId}" -> "${newId}" by component [${componentName}]. Reason: "${reason}"`
    );

    if (newId === null || newId === undefined || newId === "") {
      console.warn(`[SessionManager WARNING] Session ID cleared or set to null/empty! Call Stack:\n${callStack}`);
    }
  }

  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = localStorage.getItem("interview_session_id") || null;
    }
    return this.sessionId;
  }

  setSessionId(id, reason = "Unspecified mutation", componentName = "Unknown Component") {
    const prevId = this.sessionId;
    this.sessionId = id;
    try {
      if (id) {
        localStorage.setItem("interview_session_id", id);
      } else {
        localStorage.removeItem("interview_session_id");
      }
    } catch (err) {
      console.error("[SessionManager] Storage write failed:", err);
    }
    this.logMutation(prevId, id, componentName, reason);
  }

  clearSession(reason = "Clear session triggered", componentName = "Unknown Component") {
    const prevId = this.sessionId;
    this.sessionId = null;
    this.backendState = "CREATED";
    this.initializationStatus = "IDLE";
    try {
      localStorage.removeItem("interview_session_id");
      localStorage.removeItem("interview_first_question");
      localStorage.removeItem("interview_blueprint");
      localStorage.removeItem("interview_data");
    } catch (err) {
      console.error("[SessionManager] Storage clear failed:", err);
    }
    this.logMutation(prevId, null, componentName, reason);
  }

  getMutationLogs() {
    return this.mutationLogs;
  }

  isValid() {
    const activeId = this.getSessionId();
    return activeId !== null && activeId !== undefined && activeId !== "" && activeId !== "null" && activeId !== "undefined";
  }

  // --- Central Session Controller Additions ---

  getInitializationStatus() {
    return this.initializationStatus;
  }

  setInitializationStatus(status) {
    console.log(`[SessionManager] Initialization status updated: ${this.initializationStatus} -> ${status}`);
    this.initializationStatus = status;
  }

  getBackendState() {
    return this.backendState;
  }

  setBackendState(state) {
    console.log(`[SessionManager] Local backendState reference updated to: ${state}`);
    this.backendState = state;
  }

  logTransition(prevStatus, newStatus, source, reason) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      prevStatus,
      newStatus,
      source,
      reason
    };
    this.stateLogs.unshift(logEntry);
    if (this.stateLogs.length > 50) this.stateLogs.pop();
    console.log(`[SessionController STATE TRANSITION] [${timestamp}] ${prevStatus} -> ${newStatus} by [${source}]. Reason: "${reason}"`);
  }

  getStateLogs() {
    return this.stateLogs;
  }

  async updateBackendState(targetStatus, reason = "Unspecified", componentName = "Unknown Component") {
    if (!this.isValid()) {
      console.warn(`[SessionController Warning] Blocked transition to ${targetStatus}: Session ID is null/invalid.`);
      return;
    }
    const sessionId = this.getSessionId();
    const currentStatus = this.backendState;

    // Define state precedence to enforce strictly forward transitions (except ACTIVE <-> PAUSED)
    const STATE_PRECEDENCE = {
      "NOT_CREATED": 0,
      "CREATED": 1,
      "READY": 2,
      "ACTIVE": 3,
      "PAUSED": 4, 
      "COMPLETED": 5,
      "TERMINATED": 5,
      "EXPIRED": 5
    };

    if (targetStatus === currentStatus) {
      console.log(`[SessionController] Status is already ${targetStatus}. Ignoring duplicate transition request.`);
      return;
    }

    // Allowed: ACTIVE <-> PAUSED transitions
    const isPausedActiveTransition = 
      (currentStatus === "ACTIVE" && targetStatus === "PAUSED") || 
      (currentStatus === "PAUSED" && targetStatus === "ACTIVE");

    if (!isPausedActiveTransition && STATE_PRECEDENCE[targetStatus] <= STATE_PRECEDENCE[currentStatus]) {
      console.warn(`[SessionController] Rejected backward state transition: ${currentStatus} -> ${targetStatus}. Reason: ${reason}`);
      return;
    }

    try {
      this.logTransition(currentStatus, targetStatus, componentName, reason);
      const res = await interviewAPI.updateSessionState({ session_id: sessionId, status: targetStatus });
      if (res && res.success) {
        this.backendState = targetStatus;
        console.log(`[SessionController] Backend state successfully synchronized to: ${targetStatus}`);
      }
    } catch (err) {
      console.error(`[SessionController] Failed to update backend status to ${targetStatus}:`, err);
    }
  }
}

export const SessionManager = new SessionManagerClass();
export default SessionManager;
