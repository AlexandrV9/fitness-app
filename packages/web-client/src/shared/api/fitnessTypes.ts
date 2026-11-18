export type Pagination = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type Paginated<T> = { data: T[]; pagination: Pagination };

export type ParameterField = {
  key: string;
  label?: string;
  unit?: string;
  type: "integer" | "number" | "string" | "text" | "boolean";
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
};

export type Exercise = {
  id: string;
  userId: string;
  name: string;
  parameterSchema: ParameterField[];
};

export type WorkoutTemplate = { id: string; userId: string; name: string };
export type TemplateExerciseInput = { exerciseId: string; plannedSets: number | null };
export type TemplateInput = { name: string; exercises: TemplateExerciseInput[] };
export type TemplateDetail = WorkoutTemplate & {
  exercises: (TemplateExerciseInput & { id: string; name: string; position: number })[];
};

export type ParameterValues = Record<string, string | number | boolean>;
export type WorkoutSet = {
  id: string;
  setNumber: number;
  status: "pending" | "completed" | "skipped";
  parameterValues: ParameterValues;
};
export type SetInput =
  | { status: "completed"; parameterValues: ParameterValues }
  | { status: "skipped" };

export type WorkoutExercise = {
  id: string;
  exerciseId: string | null;
  name: string;
  position: number;
  isSkipped: boolean;
  parameterSchema: ParameterField[];
  sets: WorkoutSet[];
};
export type Workout = {
  id: string;
  userId: string;
  templateId: string | null;
  templateName: string;
  startedAt: string;
  finishedAt: string | null;
};
export type WorkoutDetail = Workout & { exercises: WorkoutExercise[] };
