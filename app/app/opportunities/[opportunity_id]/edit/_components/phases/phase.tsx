import { Badge } from "@components/ui/badge";
import {
  UseFieldArrayRemove,
  UseFieldArrayUpdate,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import { z } from "zod";
import { OpportunitySchema, PhaseSchema } from "@lib/schemas/opportunity";
import { AddQuestionnairePopover } from "./addQuestionnairePopover";
import { X } from "lucide-react";
import { Questionnaire } from "./questionnaire";

interface Props {
  index: number;
  phase: z.infer<typeof PhaseSchema>;
  remove: UseFieldArrayRemove;
  update: UseFieldArrayUpdate<z.infer<typeof OpportunitySchema>, "phases">;
}

export default function Phase({ index, phase, remove: removePhase }: Props) {
  const form = useFormContext<z.infer<typeof OpportunitySchema>>();
  const {
    fields: questionaires,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: `phases.${index}.questionnaires`,
  });

  return (
    <div className="grid min-h-[250px] grid-rows-[3rem,_1fr]">
      <div className="flex w-5/6 items-center justify-between">
        <div className="flex items-center space-x-1.5 text-sm font-medium">
          <Badge variant="secondary">{index + 1}</Badge>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {phase.name}
          </h4>
        </div>
        <Button onClick={() => removePhase(index)} size="icon" variant="ghost">
          <X />
        </Button>
      </div>
      <div>
        <Separator />
        <div className="flex h-full w-4/5 flex-col items-center justify-center gap-2">
          {questionaires.map((questionaire) => (
            <Questionnaire
              key={questionaire.id}
              defaultValues={questionaire}
              append={append}
              onRemove={() => remove(index)}
            />
          ))}

          <AddQuestionnairePopover append={append} />
        </div>
      </div>
    </div>
  );
}