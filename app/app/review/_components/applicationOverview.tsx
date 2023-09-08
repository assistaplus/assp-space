import { Checkbox } from "@components/Checkbox";
import Link from "next/link";

export function ApplicationOverview({ data }) {
  return (
    <div className="space-y-4 overflow-scroll">
      <div className="col-span-2 text-2xl">Application</div>
      <hr className="border-2 border-black dark:border-white" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <span className="font-thin">ID: </span>
          {data.id}
        </div>
        <div>
          <span className="font-thin">From: </span>
          {data.submission?.data?.formName}
        </div>
        <div>
          <span className="font-thin">Created at: </span>
          {data.submission?.data?.createdAt &&
            new Date(data.submission?.data?.createdAt).toDateString()}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {data.submission?.data?.fields
          ?.sort((fieldA, fieldB) => {
            if (typeof fieldA.value == "boolean") {
              return -1;
            }
          })
          .filter((field) => field.value != null && field.type != "CHECKBOXES")
          .map((field) => {
            return (
              <div
                key={field.label}
                className={`${
                  field.type == "TEXTAREA" ? "md:col-span-2" : ""
                } border-b border-black pb-2 dark:border-white`}
              >
                <div className="font-thin">{field.label}</div>
                {typeof field.value == "boolean" ? (
                  <Checkbox checked={field.value} onCheckedChange={undefined} />
                ) : (
                  <div className="font-medium">
                    {field.type == "FILE_UPLOAD" ||
                    field.type == "INPUT_LINK" ? (
                      <Link
                        target="_blank"
                        className="text-blue-500"
                        href={`${field.type != "FILE_UPLOAD" ? "//" : ""}${
                          field.value[0].url || field.value || null
                        }`}
                      >
                        {field.value[0].url || field.value || null ? (
                          <p>link</p>
                        ) : (
                          <p>-</p>
                        )}
                      </Link>
                    ) : field.type == "CHECKBOXES" ||
                      field.type == "DROPDOWN" ||
                      field.type == "MULTIPLE_CHOICE" ? (
                      <div>
                        {field.value.map((choicId) => {
                          const choice = field.options.find(
                            (option) => option.id == choicId,
                          );
                          if (choice) {
                            return choice.value || choice.text;
                          } else {
                            return "UNKNOWN";
                          }
                        })}
                      </div>
                    ) : (
                      JSON.stringify(field.value).replaceAll('"', "")
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}