"use client";
import { Button } from "@components/Button";
import Input from "@components/Input";
import Select from "@components/Select";
import { ErrorMessage, Field, Form, Formik, FormikValues } from "formik";
import * as Yup from "yup";
import { FormProps } from "./ReviewForm";
import toast from "react-hot-toast";
import axios from "axios";

export const MembershipReviewForm = ({ application, form }: FormProps) => {
  const applicationId = application?.id;
  const initialValues = form || {
    motivation: null,
    skill: null,
    fit: null,
    in_tumai: null,
    comment_fit_tumai: "",
    timecommit: "",
    dept1_score: null,
    dept2_score: null,
    dept3_score: null,
    maybegoodfit: "",
    furthercomments: "",
  };

  const schema = Yup.object().shape({
    motivation: Yup.number().min(1).max(5).required(),
    skill: Yup.number().min(1).max(5).required(),
    fit: Yup.number().min(1).max(5).required(),
    in_tumai: Yup.string().required("fit in tumai is required"),
    comment_fit_tumai: Yup.string(),
    timecommit: Yup.string(),
    dept1_score: Yup.number()
      .min(1)
      .max(5)
      .required("Add a score for department 1"),
    dept2_score: Yup.number()
      .min(1)
      .max(5)
      .required("Add a score for department 2"),
    dept3_score: Yup.number()
      .min(1)
      .max(5)
      .required("Add a score for department 3"),
    maybegoodfit: Yup.string(),
    furthercomments: Yup.string(),
  });

  const likeToSee = {
    Definitely: "DEFINITELY",
    Yes: "YES",
    Maybe: "MAYBE",
    No: "NO",
  };

  const submitReview = (values: FormikValues) => {
    toast.promise(
      axios.post("/review_tool/application_review", {
        data: {
          form: values,
          review_type: "MEMBERSHIP",
          reviewee_id: application?.id,
        },
      }),
      {
        loading: "Submitting review",
        success: "Successfully submitted review",
        error: "Failed to submit review",
      },
    );
  };

  const updateReview = (values: FormikValues, id: number) => {
    toast.promise(
      axios.patch(`/review_tool/update_review/${id}`, {
        data: {
          form: values,
          review_type: "MEMBERSHIP",
          reviewee_id: application?.id,
        },
      }),
      {
        loading: "Updating review",
        success: "Successfully updated review",
        error: "Failed to update review",
      },
    );
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={(values: FormikValues) => {
        if (form) {
          updateReview(values, applicationId);
        } else {
          submitReview(values);
        }
      }}
    >
      {({ values, setFieldValue }) => (
        <Form className="grid h-fit gap-4 rounded-lg bg-gray-200 p-8 dark:bg-gray-600 md:grid-cols-2">
          <h2 className="text-2xl lg:col-span-2">Submit Review</h2>
          <div>
            <Field
              as={Input}
              label="Motivation"
              type="number"
              name="motivation"
              fullWidth
            />
            <ErrorMessage
              component="p"
              className="text-red-500"
              name="motivation"
            />
          </div>

          <div>
            <Field
              as={Input}
              label="Skill"
              type="number"
              name="skill"
              fullWidth
            />
            <ErrorMessage component="p" className="text-red-500" name="skill" />
          </div>

          <div>
            <Field
              as={Input}
              label="Overall fit"
              type="number"
              name="fit"
              fullWidth
            />
            <ErrorMessage component="p" className="text-red-500" name="fit" />
          </div>

          <div>
            <Field
              label={"Fit in TUM.ai?"}
              name={`in_tumai`}
              as={Select}
              placeholder={"select"}
              options={Object.entries(likeToSee).map(([key, value]) => ({
                key: key,
                value: value,
              }))}
              selectedItem={{
                key: likeToSee[values["in_tumai"]],
                value: values["in_tumai"],
              }}
              setSelectedItem={(value) => {
                setFieldValue(`in_tumai`, value);
              }}
            />
            <ErrorMessage
              component="p"
              className="text-red-500"
              name="in_tumai"
            />
          </div>

          <div className="md:col-span-2">
            <Field
              as={Input}
              label="Tum.ai fit comment"
              type="text"
              name="comment_fit_tumai"
              fullWidth
            />
            <ErrorMessage
              component="p"
              className="text-red-500"
              name="comment_fit_tumai"
            />
          </div>

          <div>
            <Field
              as={Input}
              label="Time commitment"
              type="text"
              name="timecommit"
              fullWidth
            />
            <ErrorMessage
              component="p"
              className="text-red-500"
              name="timecommit"
            />
          </div>

          <div>
            <Field
              as={Input}
              label="Department 1 score"
              type="number"
              name="dept1_score"
              fullWidth
            />
            <ErrorMessage
              component="p"
              className="text-red-500"
              name="dept1_score"
            />
          </div>

          <div>
            <Field
              as={Input}
              label="Department 2 score"
              type="number"
              name="dept2_score"
              fullWidth
            />
            <ErrorMessage
              component="p"
              className="text-red-500"
              name="dept2_score"
            />
          </div>

          <div>
            <Field
              as={Input}
              label="Department 3 score"
              type="number"
              name="dept3_score"
              fullWidth
            />
            <ErrorMessage
              component="p"
              className="text-red-500"
              name="dept3_score"
            />
          </div>

          <div className="md:col-span-2">
            <Field
              as={Input}
              label="Good fit?"
              type="text"
              name="maybegoodfit"
              fullWidth
            />
            <ErrorMessage
              component="p"
              className="text-red-500"
              name="maybegoodfit"
            />
          </div>

          <div className="md:col-span-2">
            <Field
              as={Input}
              label="Further comments"
              type="text"
              name="furthercomments"
              fullWidth
            />
            <ErrorMessage
              component="p"
              className="text-red-500"
              name="furthercomments"
            />
          </div>

          <Button className="lg:col-span-2" type="submit">
            Submit review
          </Button>
        </Form>
      )}
    </Formik>
  );
};
