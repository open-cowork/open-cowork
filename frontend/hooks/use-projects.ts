import { useState, useCallback, useEffect } from "react";
import { projectsApi } from "@/lib/api/projects";
import type { ProjectItem } from "@/lib/api-types";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      const data = await projectsApi.list();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (name: string) => {
    // Optimistic update or wait for API
    try {
      const newProject = await projectsApi.create(name);
      setProjects((prev) => [...prev, newProject]);
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  return {
    projects,
    isLoading,
    addProject,
  };
}
