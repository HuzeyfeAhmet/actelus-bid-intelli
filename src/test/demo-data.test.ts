import { describe, expect, it } from "vitest";
import { INITIAL_PROJECTS, STORAGE_KEY, computeMetrics, filterProjects, loadState, reducer, reviewCount, docToText, type Project } from "@/components/site/demo-data";

const fresh = (): Project[] => structuredClone(INITIAL_PROJECTS);
const projectAt = (projects: Project[], index: number): Project => {
  const project = projects[index];
  if (!project) throw new Error(`Missing fixture project ${index}`);
  return project;
};
const firstQuestion = (project: Project) => {
  const question = project.questions[0];
  if (!question) throw new Error("Missing fixture question");
  return question;
};

describe("demo dashboard rules", () => {
  it("toggling a checklist item only changes that project and updates review count", () => {
    const s = reducer(fresh(), { type: "toggleCheck", projectId: "p1", itemId: "c3" });
    expect(projectAt(s, 0).checklist.find((c) => c.id === "c3")?.done).toBe(true);
    expect(reviewCount(projectAt(s, 0))).toBe(reviewCount(projectAt(INITIAL_PROJECTS, 0)) - 1);
    expect(projectAt(s, 1)).toEqual(projectAt(INITIAL_PROJECTS, 1));
    const back = reducer(s, { type: "toggleCheck", projectId: "p1", itemId: "c3" });
    expect(projectAt(back, 0).checklist.find((c) => c.id === "c3")?.done).toBe(false);
  });

  it("review flag toggles on and off and is counted", () => {
    let s = reducer(fresh(), { type: "toggleFlag", projectId: "p2" });
    expect(computeMetrics(s).flagged).toBe(1);
    s = reducer(s, { type: "toggleFlag", projectId: "p2" });
    expect(computeMetrics(s).flagged).toBe(0);
  });

  it("questions can be added, resolved, reopened and deleted", () => {
    let s = reducer(fresh(), { type: "addQuestion", projectId: "p3", text: "  Who provides fire pump?  " });
    const q = firstQuestion(projectAt(s, 2));
    expect(q.text).toBe("Who provides fire pump?");
    expect(computeMetrics(s).review).toBe(computeMetrics(INITIAL_PROJECTS).review + 1);
    s = reducer(s, { type: "toggleQuestion", projectId: "p3", questionId: q.id });
    expect(firstQuestion(projectAt(s, 2)).resolved).toBe(true);
    s = reducer(s, { type: "toggleQuestion", projectId: "p3", questionId: q.id });
    expect(firstQuestion(projectAt(s, 2)).resolved).toBe(false);
    s = reducer(s, { type: "deleteQuestion", projectId: "p3", questionId: q.id });
    expect(projectAt(s, 2).questions).toHaveLength(0);
  });

  it("blank questions are ignored", () => {
    const s = reducer(fresh(), { type: "addQuestion", projectId: "p3", text: "   " });
    expect(projectAt(s, 2).questions).toHaveLength(0);
  });

  it("filters by status and search text", () => {
    expect(filterProjects(INITIAL_PROJECTS, "", "Scope Clarification").map((p) => p.id)).toEqual(["p2"]);
    expect(filterProjects(INITIAL_PROJECTS, "library", "All").map((p) => p.id)).toEqual(["p3"]);
    expect(filterProjects(INITIAL_PROJECTS, "hvac", "All").map((p) => p.id)).toEqual(["p2"]);
    expect(filterProjects(INITIAL_PROJECTS, "library", "Addendum Review")).toHaveLength(0);
  });

  it("status change moves a project out of 'under review'", () => {
    const s = reducer(fresh(), { type: "setStatus", projectId: "p1", status: "Ready for Team Review" });
    expect(computeMetrics(s).underReview).toBe(1);
  });

  it("persisted state is restored and corrupt state falls back; reset restores defaults", () => {
    const changed = reducer(fresh(), { type: "toggleFlag", projectId: "p1" });
    const store = new Map([[STORAGE_KEY, JSON.stringify(changed)]]);
    expect(projectAt(loadState({ getItem: (k) => store.get(k) ?? null }), 0).flagged).toBe(true);
    expect(loadState({ getItem: () => "{not json" })).toEqual(INITIAL_PROJECTS);
    expect(reducer(changed, { type: "reset" })).toEqual(INITIAL_PROJECTS);
  });

  it("empty saved projects restore the three sample projects", () => {
    const restored = loadState({ getItem: () => "[]" });
    expect(restored).toEqual(INITIAL_PROJECTS);
    expect(restored).toHaveLength(3);
  });

  it("document download text is labelled as a sample", () => {
    const project = projectAt(INITIAL_PROJECTS, 0);
    const doc = project.documents[2];
    if (!doc) throw new Error("Missing fixture document");
    const t = docToText(project, doc);
    expect(t).toContain("SAMPLE DOCUMENT");
    expect(t).toContain("E-603 Rev 2");
  });
});
