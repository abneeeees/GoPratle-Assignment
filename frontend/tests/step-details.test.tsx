import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { StepDetails } from "@/components/steps/StepDetails";
import type { Bind } from "@/components/steps/types";
import { emptyCategoryValues, emptyFormValues, type FormValues } from "@/lib/types";

/**
 * The core requirement of the assignment: steps 2 and 3 must change based on
 * the step-1 category. These tests assert the field sets are genuinely
 * different, not just relabelled.
 */

function Harness({ category }: { category: FormValues["category"] }) {
  const form = useForm<FormValues>({
    defaultValues: {
      ...emptyFormValues(),
      category,
      ...(category ? emptyCategoryValues(category) : {}),
    },
  });

  const bind: Bind = (name) => form.register(name as any);

  return <StepDetails form={form} bind={bind} clearError={() => {}} errors={{}} />;
}

describe("StepDetails", () => {
  it("renders planner fields only for the planner category", () => {
    render(<Harness category="planner" />);

    expect(screen.getByLabelText(/number of guests/i)).toBeDefined();
    expect(screen.getByLabelText(/planner experience/i)).toBeDefined();
    expect(screen.getByText(/services needed/i)).toBeDefined();

    expect(screen.queryByLabelText(/performer type/i)).toBeNull();
    expect(screen.queryByLabelText(/crew role/i)).toBeNull();
  });

  it("renders performer fields only for the performer category", () => {
    render(<Harness category="performer" />);

    expect(screen.getByLabelText(/performer type/i)).toBeDefined();
    expect(screen.getByLabelText(/genre/i)).toBeDefined();
    expect(screen.getByLabelText(/set length/i)).toBeDefined();

    expect(screen.queryByLabelText(/number of guests/i)).toBeNull();
    expect(screen.queryByLabelText(/crew role/i)).toBeNull();
  });

  it("renders crew fields only for the crew category", () => {
    render(<Harness category="crew" />);

    expect(screen.getByLabelText(/crew role/i)).toBeDefined();
    expect(screen.getByLabelText(/headcount/i)).toBeDefined();
    expect(screen.getByLabelText(/shift length/i)).toBeDefined();

    expect(screen.queryByLabelText(/number of guests/i)).toBeNull();
    expect(screen.queryByLabelText(/performer type/i)).toBeNull();
  });

  it("asks for a category when step 1 is incomplete", () => {
    render(<Harness category="" />);

    expect(screen.getByText(/pick a category in step 1 first/i)).toBeDefined();
  });
});
