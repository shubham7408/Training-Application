import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";

function AddProjects() {
  const initialValues = {
    projectName: "",
    projectDescription: "",
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
    } else if (!values.projectDescription) {
      errors.projectDescription = "Project description is required";
    } else if (!values.project_id) {
      errors.project_id = "Project ID is required";
    } else if (!values.project_route) {
      errors.project_route = "Project route is required";
    } else if (!values.project_title) {
      errors.project_title = "Project title is required";
    }
    return errors;
  };

  const handleSubmit = (values, { setSubmitting }) => {
    console.log(values);
    setSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow-md">
      <h2 className="text-lg font-bold mb-4">Add Project</h2>
      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="projectName"
              >
                Project Name:
              </label>
              <Field
                type="text"
                name="projectName"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.projectName && touched.projectName
                    ? "border-blue-500"
                    : ""
                }`}
              />
              <ErrorMessage
                name="projectName"
                component="div"
                className="text-red-500 text-xs italic"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="projectDescription"
              >
                Project Description:
              </label>
              <Field
                as="textarea"
                name="projectDescription"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.projectDescription && touched.projectDescription
                    ? "border-blue-500"
                    : ""
                }`}
                rows="5"
              />
              <ErrorMessage
                name="projectDescription"
                component="div"
                className="text-red-500 text-xs italic"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="project_id"
              >
                Project ID:
              </label>
              <Field
                type="number"
                name="project_id"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.project_id && touched.project_id
                    ? "border-blue-500"
                    : ""
                }`}
              />
              <ErrorMessage
                name="project_id"
                component="div"
                className="text-red-500 text-xs italic"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="project_route"
              >
                Project Route:
              </label>
              <Field
                type="text"
                name="project_route"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.project_route && touched.project_route
                    ? "border-blue-500"
                    : ""
                }`}
              />
              <ErrorMessage
                name="project_route"
                component="div"
                className="text-red-500 text-xs italic"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="project_title"
              >
                Project Title:
              </label>
              <Field
                type="text"
                name="project_title"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.project_title && touched.project_title
                    ? "border-blue-500"
                    : ""
                }`}
              />
              <ErrorMessage
                name="project_title"
                component="div"
                className="text-red-500 text-xs italic"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="is_active"
              >
                Is Active:
              </label>
              <Field
                as="select"
                name="is_active"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.is_active && touched.is_active ? "border-blue-500" : ""
                }`}
              >
                <option value={true}>True</option>
                <option value={false}>False</option>
              </Field>
              <ErrorMessage
                name="is_active"
                component="div"
                className="text-red-500 text-xs italic"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="is_toloka"
              >
                Is Argos:
              </label>
              <Field
                as="select"
                name="is_toloka"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.is_toloka && touched.is_toloka ? "border-blue-500" : ""
                }`}
              >
                <option value={true}>True</option>
                <option value={false}>False</option>
              </Field>
              <ErrorMessage
                name="is_toloka"
                component="div"
                className="text-red-500 text-xs italic"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="finished_task_number"
              >
                Finished Task Number:
              </label>
              <Field
                type="number"
                name="finished_task_number"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.finished_task_number && touched.finished_task_number
                    ? "border-blue-500"
                    : ""
                }`}
              />
              <ErrorMessage
                name="finished_task_number"
                component="div"
                className="text-red-500 text-xs italic"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="task_number"
              >
                Task Number:
              </label>
              <Field
                type="number"
                name="task_number"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.task_number && touched.task_number
                    ? "border-blue-500"
                    : ""
                }`}
              />
              <ErrorMessage
                name="task_number"
                component="div"
                className="text-red-500 text-xs italic"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Project
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default AddProjects;
