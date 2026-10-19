"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Enquiry,
  SalesFunnel,
  Activity,
  SalesRepresentative,
  WorkspaceSettings,
  FunnelExecution,
  FunnelStage,
  SimulatedMessage,
} from "@/types";
import {
  INITIAL_ENQUIRIES,
  INITIAL_FUNNEL,
  INITIAL_ACTIVITIES,
  INITIAL_REPRESENTATIVES,
  INITIAL_SETTINGS,
  INITIAL_EXECUTIONS,
} from "@/data/seed-data";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface AppContextType {
  enquiries: Enquiry[];
  funnels: SalesFunnel[];
  activeFunnel: SalesFunnel | undefined;
  activeFunnelId: string;
  setActiveFunnelId: (id: string) => void;
  executions: Record<string, FunnelExecution>;
  activities: Activity[];
  representatives: SalesRepresentative[];
  settings: WorkspaceSettings;
  unreadNotificationsCount: number;
  notifications: { id: string; title: string; time: string; type: string; unread: boolean }[];
  markNotificationsAsRead: () => void;
  // Enquiry operations
  addEnquiry: (enquiry: Partial<Enquiry>, options?: { silent?: boolean }) => Enquiry;
  updateEnquiry: (id: string, updates: Partial<Enquiry>) => void;
  deleteEnquiry: (id: string) => void;
  bulkUpdateEnquiries: (ids: string[], updates: Partial<Enquiry>) => void;
  importEnquiries: (newEnquiries: Partial<Enquiry>[]) => number;
  // Funnel operations
  saveFunnel: (funnel: SalesFunnel) => void;
  activateFunnel: (funnelId: string, leadIds?: string[]) => void;
  // Execution operations
  getExecutionForEnquiry: (enquiryId: string) => FunnelExecution | undefined;
  toggleStageAction: (enquiryId: string, stageId: string, actionText: string) => void;
  completeExecutionStage: (enquiryId: string, stageId: string) => void;
  skipExecutionStage: (enquiryId: string, stageId: string) => void;
  moveEnquiryToStage: (enquiryId: string, targetStageId: string) => void;
  pauseResumeExecution: (enquiryId: string) => void;
  addSimulatedMessage: (enquiryId: string, stageId: string, msg: SimulatedMessage) => void;
  // Activity operations
  addActivity: (activity: Omit<Activity, "id">) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  toggleActivityStatus: (id: string) => void;
  // Settings & Reset
  updateSettings: (updates: Partial<WorkspaceSettings>) => void;
  resetToDemoData: () => void;
  // Global search & Modals
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCreateEnquiryOpen: boolean;
  setIsCreateEnquiryOpen: (open: boolean) => void;
  isImportOpen: boolean;
  setIsImportOpen: (open: boolean) => void;
  selectedEnquiryForExecution: Enquiry | null;
  setSelectedEnquiryForExecution: (enquiry: Enquiry | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "sleek_ai_storage_v1";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(INITIAL_ENQUIRIES);
  const [funnels, setFunnels] = useState<SalesFunnel[]>([INITIAL_FUNNEL]);
  const [activeFunnelId, setActiveFunnelId] = useState<string>("fnl_enterprise_core");
  const [executions, setExecutions] = useState<Record<string, FunnelExecution>>(INITIAL_EXECUTIONS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [representatives] = useState<SalesRepresentative[]>(INITIAL_REPRESENTATIVES);
  const [settings, setSettings] = useState<WorkspaceSettings>(INITIAL_SETTINGS);

  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      title: "Marcus Sterling viewed your calendar link",
      time: "10 mins ago",
      type: "lead",
      unread: true,
    },
    {
      id: "n2",
      title: "Nathalie Dubois idle threshold exceeded (5 days)",
      time: "1 hour ago",
      type: "alert",
      unread: true,
    },
    {
      id: "n3",
      title: "Kavita Reddy payment verified ($72,000)",
      time: "3 hours ago",
      type: "success",
      unread: false,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateEnquiryOpen, setIsCreateEnquiryOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedEnquiryForExecution, setSelectedEnquiryForExecution] = useState<Enquiry | null>(null);

  // Load from local storage
  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.enquiries) setEnquiries(parsed.enquiries);
        if (parsed.funnels) setFunnels(parsed.funnels);
        if (parsed.activeFunnelId) setActiveFunnelId(parsed.activeFunnelId);
        if (parsed.executions) setExecutions(parsed.executions);
        if (parsed.activities) setActivities(parsed.activities);
        if (parsed.settings) setSettings(parsed.settings);
      }
    } catch (e) {
      console.warn("Failed to read from localStorage", e);
    }
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          enquiries,
          funnels,
          activeFunnelId,
          executions,
          activities,
          settings,
        })
      );
    } catch (e) {
      console.warn("Failed to save to localStorage", e);
    }
  }, [enquiries, funnels, activeFunnelId, executions, activities, settings, isClient]);

  const activeFunnel = funnels.find((f) => f.id === activeFunnelId) || funnels[0];

  const unreadNotificationsCount = notifications.filter((n) => n.unread).length;

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Enquiry operations
  const addEnquiry = (data: Partial<Enquiry>, options?: { silent?: boolean }): Enquiry => {
    const defaultRep = representatives[0];
    const defaultStage = activeFunnel?.stages[0];

    const fullName =
      data.fullName ||
      [data.firstName, data.lastName].filter(Boolean).join(" ") ||
      "Unnamed Lead";
    const firstName = data.firstName || (data.fullName ? data.fullName.split(" ")[0] : "");
    const lastName = data.lastName || (data.fullName ? data.fullName.split(" ").slice(1).join(" ") : "");
    const source = data.source || (data.sourceType as LeadSource) || "Website";
    const sourceType = data.sourceType || source;
    const status = data.status || "New";

    const newEnquiry: Enquiry = {
      id: data.id ? String(data.id) : `enq_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      enquiryNumber: data.enquiryNumber || `ENQ-${Math.floor(100000 + Math.random() * 900000)}`,
      firstName,
      lastName,
      fullName,
      mobile: data.mobile || "",
      email: data.email || "",
      city: data.city || "San Francisco",
      company: data.company || "Independent",
      source,
      sourceType,
      dateCreated: new Date().toISOString(),
      assignedRepId: data.assignedRepId || defaultRep.id,
      assignedRepName: data.assignedRepName || defaultRep.name,
      currentFunnelId: activeFunnelId,
      currentStageId: defaultStage?.id || "stg_new",
      currentStageName: defaultStage?.name || "New Lead",
      status,
      priority: data.priority || "Medium",
      lastContactedDate: new Date().toISOString(),
      nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      leadScore: Math.floor(Math.random() * 30) + 60,
      estimatedValue: data.estimatedValue || 25000,
      tags: data.tags || ["Inbound"],
      notes: data.notes || [],
      aiSummary: data.aiSummary || "Newly ingested inquiry. Ready for first touch qualification.",
      aiRecommendedAction: "Send welcome intro and initiate discovery questionnaire.",
      daysInStage: 0,
      activitiesCount: 0,
    };

    setEnquiries((prev) => [newEnquiry, ...prev]);

    // Initialize execution
    if (activeFunnel && defaultStage) {
      setExecutions((prev) => ({
        ...prev,
        [newEnquiry.id]: {
          enquiryId: newEnquiry.id,
          funnelId: activeFunnel.id,
          currentStageId: defaultStage.id,
          status: "in_progress",
          isPaused: false,
          startedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          stageExecutions: {
            [defaultStage.id]: {
              stageId: defaultStage.id,
              status: "in_progress",
              completedActions: [],
              notes: "Initialized newly enrolled lead.",
              simulatedMessages: [],
            },
          },
        },
      }));
    }

    if (!options?.silent) {
      toast.success("Enquiry created successfully", {
        description: `${newEnquiry.fullName} has been added to ${activeFunnel?.name || "funnel"}.`,
      });
    }

    return newEnquiry;
  };

  const updateEnquiry = (id: string, updates: Partial<Enquiry>) => {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    toast.info("Enquiry updated");
  };

  const deleteEnquiry = (id: string) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
    toast.success("Enquiry deleted");
  };

  const bulkUpdateEnquiries = (ids: string[], updates: Partial<Enquiry>) => {
    setEnquiries((prev) =>
      prev.map((e) => (ids.includes(e.id) ? { ...e, ...updates } : e))
    );
    toast.success(`Updated ${ids.length} enquiries`);
  };

  const importEnquiries = (records: Partial<Enquiry>[]): number => {
    const defaultRep = representatives[0];
    const defaultStage = activeFunnel?.stages[0];

    const newItems: Enquiry[] = records.map((rec, index) => ({
      id: `enq_imp_${Date.now()}_${index}`,
      fullName: rec.fullName || "Unnamed Lead",
      mobile: rec.mobile || "+1 (555) 000-0000",
      email: rec.email || `lead${index}@example.com`,
      city: rec.city || "New York",
      company: rec.company || "Business Corp",
      source: rec.source || "Website",
      dateCreated: new Date().toISOString(),
      assignedRepId: defaultRep.id,
      assignedRepName: defaultRep.name,
      currentFunnelId: activeFunnelId,
      currentStageId: defaultStage?.id || "stg_new",
      currentStageName: defaultStage?.name || "New Lead",
      status: "New",
      priority: rec.priority || "Medium",
      lastContactedDate: new Date().toISOString(),
      nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      leadScore: Math.floor(Math.random() * 40) + 55,
      estimatedValue: rec.estimatedValue || 20000 + Math.floor(Math.random() * 30000),
      tags: ["Imported", "Batch"],
      notes: [],
      aiSummary: "Enquiry imported via spreadsheet. AI prioritization pending.",
      aiRecommendedAction: "Enroll in active outreach workflow and initiate discovery touch.",
      daysInStage: 0,
      activitiesCount: 0,
    }));

    setEnquiries((prev) => [...newItems, ...prev]);

    // Create execution records
    if (activeFunnel && defaultStage) {
      setExecutions((prev) => {
        const next = { ...prev };
        newItems.forEach((item) => {
          next[item.id] = {
            enquiryId: item.id,
            funnelId: activeFunnel.id,
            currentStageId: defaultStage.id,
            status: "in_progress",
            isPaused: false,
            startedAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
            stageExecutions: {
              [defaultStage.id]: {
                stageId: defaultStage.id,
                status: "in_progress",
                completedActions: [],
                notes: "Imported into stage.",
                simulatedMessages: [],
              },
            },
          };
        });
        return next;
      });
    }

    toast.success(`Successfully imported ${newItems.length} enquiries!`);
    return newItems.length;
  };

  // Funnel operations
  const saveFunnel = (funnel: SalesFunnel) => {
    setFunnels((prev) => {
      const idx = prev.findIndex((f) => f.id === funnel.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = funnel;
        return copy;
      }
      return [funnel, ...prev];
    });
    toast.success("Funnel saved as draft");
  };

  const activateFunnel = (funnelId: string, leadIds?: string[]) => {
    const target = funnels.find((f) => f.id === funnelId);
    if (!target) return;

    const activated: SalesFunnel = {
      ...target,
      status: "active",
      updatedAt: new Date().toISOString(),
    };

    setFunnels((prev) =>
      prev.map((f) =>
        f.id === funnelId
          ? activated
          : f.status === "active"
            ? { ...f, status: "draft" }
            : f
      )
    );

    setActiveFunnelId(funnelId);

    // If specific leads or all leads are assigned
    const targetStage = activated.stages[0];
    if (targetStage) {
      setEnquiries((prev) =>
        prev.map((e) => {
          if (!leadIds || leadIds.includes(e.id)) {
            return {
              ...e,
              currentFunnelId: funnelId,
              currentStageId: targetStage.id,
              currentStageName: targetStage.name,
              daysInStage: 0,
            };
          }
          return e;
        })
      );
    }

    // Trigger celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch { }

    toast.success(`Funnel "${activated.name}" is now ACTIVE!`, {
      description: `All associated leads have been enrolled in ${activated.stages[0]?.name || "Stage 1"}.`,
    });
  };

  // Execution operations
  const getExecutionForEnquiry = (enquiryId: string): FunnelExecution | undefined => {
    if (executions[enquiryId]) return executions[enquiryId];

    // Fallback if not initialized
    const enquiry = enquiries.find((e) => e.id === enquiryId);
    if (!enquiry || !activeFunnel) return undefined;

    const currentStage = activeFunnel.stages.find((s) => s.id === enquiry.currentStageId) || activeFunnel.stages[0];

    return {
      enquiryId,
      funnelId: activeFunnel.id,
      currentStageId: currentStage.id,
      status: "in_progress",
      isPaused: false,
      startedAt: enquiry.dateCreated,
      lastUpdatedAt: new Date().toISOString(),
      stageExecutions: {
        [currentStage.id]: {
          stageId: currentStage.id,
          status: "in_progress",
          completedActions: [],
          notes: "",
          simulatedMessages: [],
        },
      },
    };
  };

  const toggleStageAction = (enquiryId: string, stageId: string, actionText: string) => {
    setExecutions((prev) => {
      const currentExec = prev[enquiryId] || {
        enquiryId,
        funnelId: activeFunnelId,
        currentStageId: stageId,
        status: "in_progress",
        isPaused: false,
        startedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        stageExecutions: {},
      };

      const stageExec = currentExec.stageExecutions[stageId] || {
        stageId,
        status: "in_progress",
        completedActions: [],
        notes: "",
        simulatedMessages: [],
      };

      const already = stageExec.completedActions.includes(actionText);
      const nextCompleted = already
        ? stageExec.completedActions.filter((a) => a !== actionText)
        : [...stageExec.completedActions, actionText];

      return {
        ...prev,
        [enquiryId]: {
          ...currentExec,
          lastUpdatedAt: new Date().toISOString(),
          stageExecutions: {
            ...currentExec.stageExecutions,
            [stageId]: {
              ...stageExec,
              completedActions: nextCompleted,
            },
          },
        },
      };
    });

    toast.info("Action item updated");
  };

  const moveEnquiryToStage = (enquiryId: string, targetStageId: string) => {
    const stage = activeFunnel?.stages.find((s) => s.id === targetStageId);
    if (!stage) return;

    const isLastStage = activeFunnel && activeFunnel.stages[activeFunnel.stages.length - 1].id === targetStageId;

    setEnquiries((prev) =>
      prev.map((e) => {
        if (e.id === enquiryId) {
          const nextStatus = isLastStage ? "Converted" : e.status === "New" ? "In Progress" : e.status;
          return {
            ...e,
            currentStageId: stage.id,
            currentStageName: stage.name,
            status: nextStatus,
            daysInStage: 0,
            lastContactedDate: new Date().toISOString(),
          };
        }
        return e;
      })
    );

    setExecutions((prev) => {
      const current = prev[enquiryId];
      if (!current) return prev;
      return {
        ...prev,
        [enquiryId]: {
          ...current,
          currentStageId: targetStageId,
          lastUpdatedAt: new Date().toISOString(),
          stageExecutions: {
            ...current.stageExecutions,
            [targetStageId]: current.stageExecutions[targetStageId] || {
              stageId: targetStageId,
              status: "in_progress",
              completedActions: [],
              notes: `Moved into ${stage.name}.`,
              simulatedMessages: [],
            },
          },
        },
      };
    });

    if (isLastStage) {
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch { }
      toast.success("Lead converted!", {
        description: `Enquiry has reached the final stage: ${stage.name}`,
      });
    } else {
      toast.success(`Moved to ${stage.name}`);
    }
  };

  const completeExecutionStage = (enquiryId: string, stageId: string) => {
    if (!activeFunnel) return;
    const currentIndex = activeFunnel.stages.findIndex((s) => s.id === stageId);
    if (currentIndex < 0) return;

    const nextStage = activeFunnel.stages[currentIndex + 1];

    setExecutions((prev) => {
      const current = prev[enquiryId];
      if (!current) return prev;

      return {
        ...prev,
        [enquiryId]: {
          ...current,
          currentStageId: nextStage ? nextStage.id : stageId,
          status: nextStage ? "in_progress" : "completed",
          lastUpdatedAt: new Date().toISOString(),
          stageExecutions: {
            ...current.stageExecutions,
            [stageId]: {
              ...(current.stageExecutions[stageId] || { stageId, completedActions: [], notes: "", simulatedMessages: [] }),
              status: "completed",
              completedAt: new Date().toISOString(),
            },
          },
        },
      };
    });

    if (nextStage) {
      moveEnquiryToStage(enquiryId, nextStage.id);
    } else {
      toast.success("All funnel stages completed for this lead!");
    }
  };

  const skipExecutionStage = (enquiryId: string, stageId: string) => {
    if (!activeFunnel) return;
    const currentIndex = activeFunnel.stages.findIndex((s) => s.id === stageId);
    if (currentIndex < 0) return;

    const nextStage = activeFunnel.stages[currentIndex + 1];

    setExecutions((prev) => {
      const current = prev[enquiryId];
      if (!current) return prev;

      return {
        ...prev,
        [enquiryId]: {
          ...current,
          currentStageId: nextStage ? nextStage.id : stageId,
          lastUpdatedAt: new Date().toISOString(),
          stageExecutions: {
            ...current.stageExecutions,
            [stageId]: {
              ...(current.stageExecutions[stageId] || { stageId, completedActions: [], notes: "", simulatedMessages: [] }),
              status: "skipped",
              completedAt: new Date().toISOString(),
            },
          },
        },
      };
    });

    if (nextStage) {
      moveEnquiryToStage(enquiryId, nextStage.id);
      toast.info(`Stage skipped. Moved to ${nextStage.name}`);
    }
  };

  const pauseResumeExecution = (enquiryId: string) => {
    setExecutions((prev) => {
      const current = prev[enquiryId];
      if (!current) return prev;
      const nextPaused = !current.isPaused;
      toast.info(nextPaused ? "Funnel execution paused" : "Funnel execution resumed");
      return {
        ...prev,
        [enquiryId]: {
          ...current,
          isPaused: nextPaused,
          lastUpdatedAt: new Date().toISOString(),
        },
      };
    });
  };

  const addSimulatedMessage = (enquiryId: string, stageId: string, msg: SimulatedMessage) => {
    setExecutions((prev) => {
      const current = prev[enquiryId];
      if (!current) return prev;
      const stageExec = current.stageExecutions[stageId] || {
        stageId,
        status: "in_progress",
        completedActions: [],
        notes: "",
        simulatedMessages: [],
      };

      return {
        ...prev,
        [enquiryId]: {
          ...current,
          stageExecutions: {
            ...current.stageExecutions,
            [stageId]: {
              ...stageExec,
              simulatedMessages: [msg, ...stageExec.simulatedMessages],
            },
          },
        },
      };
    });

    toast.success(`Simulated ${msg.channel.toUpperCase()} sent!`, {
      description: "Note: Message logged in simulated execution history.",
    });
  };

  // Activity operations
  const addActivity = (act: Omit<Activity, "id">) => {
    const newAct: Activity = {
      id: `act_${Date.now()}`,
      ...act,
    };
    setActivities((prev) => [newAct, ...prev]);
    toast.success("Activity scheduled");
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    toast.info("Activity updated");
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    toast.success("Activity deleted");
  };

  const toggleActivityStatus = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const isDone = a.status === "completed";
          return {
            ...a,
            status: isDone ? "pending" : "completed",
            completedAt: isDone ? undefined : new Date().toISOString(),
          };
        }
        return a;
      })
    );
    toast.success("Activity status updated");
  };

  const updateSettings = (updates: Partial<WorkspaceSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    toast.success("Settings saved successfully");
  };

  const resetToDemoData = () => {
    setEnquiries(INITIAL_ENQUIRIES);
    setFunnels([INITIAL_FUNNEL]);
    setActiveFunnelId("fnl_enterprise_core");
    setExecutions(INITIAL_EXECUTIONS);
    setActivities(INITIAL_ACTIVITIES);
    setSettings(INITIAL_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { }
    toast.success("Workspace reset to initial demo dataset");
  };

  return (
    <AppContext.Provider
      value={{
        enquiries,
        funnels,
        activeFunnel,
        activeFunnelId,
        setActiveFunnelId,
        executions,
        activities,
        representatives,
        settings,
        unreadNotificationsCount,
        notifications,
        markNotificationsAsRead,
        addEnquiry,
        updateEnquiry,
        deleteEnquiry,
        bulkUpdateEnquiries,
        importEnquiries,
        saveFunnel,
        activateFunnel,
        getExecutionForEnquiry,
        toggleStageAction,
        completeExecutionStage,
        skipExecutionStage,
        moveEnquiryToStage,
        pauseResumeExecution,
        addSimulatedMessage,
        addActivity,
        updateActivity,
        deleteActivity,
        toggleActivityStatus,
        updateSettings,
        resetToDemoData,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        isCreateEnquiryOpen,
        setIsCreateEnquiryOpen,
        isImportOpen,
        setIsImportOpen,
        selectedEnquiryForExecution,
        setSelectedEnquiryForExecution,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
