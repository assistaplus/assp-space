import { ErrorMessage as FormikErrorMessage } from "formik";
interface Props {
  name: string;
}

const ErrorMessage = ({ name }: Props) => {
  return (
    <FormikErrorMessage
      component="p"
      className="mt-2 font-bold text-red-500"
      name={name}
    />
  );
};

export default ErrorMessage;