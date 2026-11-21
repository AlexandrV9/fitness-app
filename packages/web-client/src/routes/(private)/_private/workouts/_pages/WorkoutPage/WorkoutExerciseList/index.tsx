import { Button, Card, Flex, IconButton } from "~/shared/ui";
import { TrashIcon } from "~/shared/ui/icons";

import { WorkoutSetItem } from "./WorkoutExerciseCard/WorkoutSetItem";

import type { WorkoutExercise, WorkoutSet } from "~/shared/api/fitnessTypes";

function sortExercisesByPosition(exercises: WorkoutExercise[]) {
  return [...exercises].sort((a, b) => a.position - b.position);
}

function sortWorkoutSets(workoutSets: WorkoutSet[]) {
  return [...workoutSets].sort((a, b) => a.setNumber - b.setNumber);
}

type WorkoutExerciseListProps = {
  workoutId: string;
  exercises: WorkoutExercise[];
  finished: boolean;
  disabled: boolean;
  showIncompleteErrors?: boolean;
  onAddSet: (exerciseId: string) => Promise<WorkoutSet>;
  onRemoveSet: (exerciseId: string, setId: string) => Promise<void>;
  onRemoveExercise: (exerciseId: string) => Promise<unknown>;
};

export function WorkoutExerciseList({
  workoutId,
  exercises,
  finished,
  disabled,
  showIncompleteErrors = false,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}: WorkoutExerciseListProps) {
  return (
    <Flex
      as="ul"
      direction="column"
      rowGap={10}
      style={{ listStyle: "none", margin: 0, padding: 0 }}
    >
      {sortExercisesByPosition(exercises)
        .filter((exercise) => !exercise.isSkipped)
        .map((exercise) => (
          <Card key={exercise.id} as="li">
            <Card.Header>
              <Card.Title>{exercise.name}</Card.Title>
              {!finished && (
                <IconButton
                  size="m"
                  variant="outline"
                  color="alert"
                  disabled={disabled}
                  aria-label={"Удалить упражнение " + exercise.name}
                  onClick={() => onRemoveExercise(exercise.id)}
                >
                  <TrashIcon />
                </IconButton>
              )}
            </Card.Header>
            <Card.Body>
              <Flex direction="column" rowGap={16} align="center">
                <Flex direction="column" as="ul" rowGap={16} isFullWidth>
                  {sortWorkoutSets(exercise.sets).map((set) => (
                    <WorkoutSetItem
                      key={set.id}
                      set={set}
                      schema={exercise.parameterSchema}
                      workoutId={workoutId}
                      exerciseId={exercise.id}
                      finished={finished}
                      disabled={disabled}
                      showIncompleteErrors={showIncompleteErrors}
                      onRemoveSet={(setId) => onRemoveSet(exercise.id, setId)}
                    />
                  ))}
                </Flex>
                {!finished && (
                  <Flex justify="end" isFullWidth>
                    <Button
                      size="m"
                      underline={false}
                      disabled={disabled}
                      onClick={() => onAddSet(exercise.id)}
                    >
                      Добавить подход
                    </Button>
                  </Flex>
                )}
              </Flex>
            </Card.Body>
          </Card>
        ))}
    </Flex>
  );
}
