import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from "axios";

function New() {
  const [submitStatus, setSubmitStatus] = useState({
    isSubmitting: false,
    submitError: null,
    submitSuccess: false,
  });

  const initialValues = {
    projectName: "",
    project_id: "",
    project_route: "",
    project_title: "",
    is_active: false,
    is_toloka: false,
    finished_task_number: 0,
    task_number: 0,
  };

  const validate = (values) => {
    const errors = {};

    if (!values.projectName) {
      errors.projectName = "Project name is required";
    }

    if (!values.project_id) {
      errors.project_id = "Project ID is required";
    }

    if (!values.project_route) {
      errors.project_route = "Project route is required";
    }

    if (!values.project_title) {
      errors.project_title = "Project title is required";
    }

    return errors;
  };

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    setSubmitStatus({
      isSubmitting: true,
      submitError: null,
      submitSuccess: false,
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/addprojects`,
        values,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSubmitStatus({
        isSubmitting: false,
        submitError: null,
        submitSuccess: true,
      });
      resetForm();
      alert("Project created successfully!");
    } catch (error) {
      console.error("Error creating project:", error);
      setSubmitStatus({
        isSubmitting: false,
        submitError:
          error.response?.data?.message || "Failed to create project",
        submitSuccess: false,
      });

      alert(
        error.response?.data?.message ||
          "Error: Unable to submit the form. Please check your network connection."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-8" data-aos="fade-right">
      <div className="py-8">
        <div className="mb-6">
          <center>
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">
              Add New Project
            </h2>
          </center>

          {submitStatus.submitError && (
            <div
              className="max-w-md mx-auto mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">
                {submitStatus.submitError}
              </span>
            </div>
          )}

          {submitStatus.submitSuccess && (
            <div
              className="max-w-md mx-auto mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">
                Project created successfully!
              </span>
            </div>
          )}

          <div className="max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
            <Formik
              initialValues={initialValues}
              validate={validate}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="projectName"
                      className="block text-md font-semibold text-gray-700"
                    >
                      Project Name:
                    </label>
                    <Field
                      type="text"
                      name="projectName"
                      className={`mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg ${
                        errors.projectName && touched.projectName
                          ? "border-red-500"
                          : ""
                      }`}
                      placeholder="Enter project name"
                    />
                    <ErrorMessage
                      name="projectName"
                      component="div"
                      className="text-red-500 text-xs italic"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="project_id"
                      className="block text-md font-semibold text-gray-700"
                    >
                      Project ID:
                    </label>
                    <Field
                      type="number"
                      name="project_id"
                      className={`mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg ${
                        errors.project_id && touched.project_id
                          ? "border-red-500"
                          : ""
                      }`}
                      placeholder="Enter project ID"
                    />
                    <ErrorMessage
                      name="project_id"
                      component="div"
                      className="text-red-500 text-xs italic"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="project_route"
                      className="block text-md font-semibold text-gray-700"
                    >
                      Project Route:
                    </label>
                    <Field
                      type="text"
                      name="project_route"
                      className={`mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg ${
                        errors.project_route && touched.project_route
                          ? "border-red-500"
                          : ""
                      }`}
                      placeholder="Enter project route"
                    />
                    <ErrorMessage
                      name="project_route"
                      component="div"
                      className="text-red-500 text-xs italic"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="project_title"
                      className="block text-md font-semibold text-gray-700"
                    >
                      Project Title:
                    </label>
                    <Field
                      type="text"
                      name="project_title"
                      className={`mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg ${
                        errors.project_title && touched.project_title
                          ? "border-red-500"
                          : ""
                      }`}
                      placeholder="Enter project title"
                    />
                    <ErrorMessage
                      name="project_title"
                      component="div"
                      className="text-red-500 text-xs italic"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="is_active"
                      className="block text-md font-semibold text-gray-700"
                    >
                      Is Active:
                    </label>
                    <Field
                      as="select"
                      name="is_active"
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                    >
                      <option value={true}>True</option>
                      <option value={false}>False</option>
                    </Field>
                  </div>

                  <div>
                    <label
                      htmlFor="is_toloka"
                      className="block text-md font-semibold text-gray-700"
                    >
                      Is Argos:
                    </label>
                    <Field
                      as="select"
                      name="is_toloka"
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                    >
                      <option value={true}>True</option>
                      <option value={false}>False</option>
                    </Field>
                  </div>

                  <div>
                    <label
                      htmlFor="finished_task_number"
                      className="block text-md font-semibold text-gray-700"
                    >
                      Finished Task Number:
                    </label>
                    <Field
                      type="number"
                      name="finished_task_number"
                      className={`mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg ${
                        errors.finished_task_number &&
                        touched.finished_task_number
                          ? "border-red-500"
                          : ""
                      }`}
                      placeholder="Enter finished task number"
                    />
                    <ErrorMessage
                      name="finished_task_number"
                      component="div"
                      className="text-red-500 text-xs italic"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="task_number"
                      className="block text-md font-semibold text-gray-700"
                    >
                      Task Number:
                    </label>
                    <Field
                      type="number"
                      name="task_number"
                      className={`mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg ${
                        errors.task_number && touched.task_number
                          ? "border-red-500"
                          : ""
                      }`}
                      placeholder="Enter task number"
                    />
                    <ErrorMessage
                      name="task_number"
                      component="div"
                      className="text-red-500 text-xs italic"
                    />
                  </div>

                  <div className="col-span-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-500 text-white py-3 px-6 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-lg"
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}

export default New;
