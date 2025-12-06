"use client";
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjects, useGroups, useProjectMutations, useGroupMutations } from '@/lib/hooks/use-projects';
import { useTasks, useTaskMutations } from '@/lib/hooks/use-tasks';
import type { CreateProjectDto, UpdateProjectDto, CreateGroupDto } from '@/lib/api/services/projects.service';
import type { CreateTaskDto } from '@/lib/api/services/tasks.service';
import { ProjectsHeader, StatsCards, SearchBar, GroupsTab, ProjectsTab, TasksTab } from './components';

export default function ProjectsManagementPageSimple() {
  const { projects, loading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects();
  const { groups, loading: groupsLoading, refetch: refetchGroups } = useGroups();
  const { tasks, loading: tasksLoading, refetch: refetchTasks } = useTasks();

  const { createProject, updateProject, deleteProject } = useProjectMutations();
  const { createGroup, deleteGroup } = useGroupMutations();
  const { createTask, deleteTask } = useTaskMutations();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const [newProject, setNewProject] = useState<CreateProjectDto>({ name: '', description: '' });
  const [newGroup, setNewGroup] = useState<CreateGroupDto>({ name: '', description: '' });
  const [newTask, setNewTask] = useState<CreateTaskDto>({
    name: '',
    description: '',
    projectId: '',
    status: 'EnAttente',
    precision: 'Medium',
    priority: 'Medium',
    estimatedTime: '00:00:00'
  });

  const handleCreateProject = async () => {
    try {
      await createProject(newProject);
      await refetchProjects();
      setIsAddProjectOpen(false);
      setNewProject({ name: '', description: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    {
      try {
        await deleteProject(id);
        await refetchProjects();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleUpdateProject = async (id: string, data: UpdateProjectDto) => {
    try {
      await updateProject(id, data);
      await refetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateGroup = async () => {
    try {
      await createGroup(newGroup);
      await refetchGroups();
      setIsAddGroupOpen(false);
      setNewGroup({ name: '', description: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    {
      try {
        await deleteGroup(id);
        await refetchGroups();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCreateTask = async () => {
    try {
      if (!newTask.projectId) {
        return;
      }
      await createTask(newTask);
      await refetchTasks();
      setIsAddTaskOpen(false);
      setNewTask({
        name: '',
        description: '',
        projectId: '',
        status: 'EnAttente',
        precision: 'Medium',
        priority: 'Medium',
        estimatedTime: '00:00:00'
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    {
      try {
        await deleteTask(id);
        await refetchTasks();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleRefreshAll = async () => {
    await Promise.all([refetchProjects(), refetchGroups(), refetchTasks()]);
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = tasks.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (projectsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{projectsError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
      <ProjectsHeader onRefresh={handleRefreshAll} />

      <StatsCards
        projectsCount={projects.length}
        groupsCount={groups.length}
        tasksCount={tasks.length}
      />

      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      <Tabs defaultValue="projects" className="space-y-3 md:space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="groups" className="text-xs md:text-sm">Sociétés</TabsTrigger>
          <TabsTrigger value="projects" className="text-xs md:text-sm">Projets</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs md:text-sm">Tâches</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <ProjectsTab
            projects={filteredProjects}
            groups={groups}
            loading={projectsLoading}
            isAddOpen={isAddProjectOpen}
            onAddOpenChange={setIsAddProjectOpen}
            newProject={newProject}
            onNewProjectChange={setNewProject}
            onCreateProject={handleCreateProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
          />
        </TabsContent>

        <TabsContent value="groups">
          <GroupsTab
            groups={filteredGroups}
            loading={groupsLoading}
            isAddOpen={isAddGroupOpen}
            onAddOpenChange={setIsAddGroupOpen}
            newGroup={newGroup}
            onNewGroupChange={setNewGroup}
            onCreateGroup={handleCreateGroup}
            onDeleteGroup={handleDeleteGroup}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksTab
            tasks={filteredTasks}
            projects={projects}
            loading={tasksLoading}
            isAddOpen={isAddTaskOpen}
            onAddOpenChange={setIsAddTaskOpen}
            newTask={newTask}
            onNewTaskChange={setNewTask}
            onCreateTask={handleCreateTask}
            onDeleteTask={handleDeleteTask}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
