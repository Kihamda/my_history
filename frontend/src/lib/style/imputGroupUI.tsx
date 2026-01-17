import { InputGroup } from "react-bootstrap";

const InputGroupUI = <T extends string | Date | number>({
  label,
  chkbox,
  setChkboxFunc,
  placeholder,
  value,
  type = "text",
  setValueFunc,
  valueDisabled,
  className,
  explain,
}: {
  label: string;
  value: T;
  type?: string;
  setValueFunc: (changedValue: T) => void;
  valueDisabled?: boolean;
  chkbox?: boolean;
  setChkboxFunc?: (checked: boolean) => void;
  placeholder?: string;
  className?: string;
  explain?: string;
}): React.ReactElement => {
  const isDate = value instanceof Date;
  const isString = typeof value === "string";
  const isNumber = typeof value === "number";

  return (
    <div className={`mb-3 ${className}`}>
      <InputGroup>
        <InputGroup.Text
          onClick={() => setChkboxFunc && setChkboxFunc(!chkbox)}
          style={{ cursor: chkbox !== undefined ? "pointer" : "default" }}
        >
          {chkbox !== undefined && (
            <input
              type="checkbox"
              className="form-check-input me-1"
              checked={chkbox}
              onChange={() => setChkboxFunc?.(!chkbox)}
              name={label}
              id={label}
            />
          )}
          {label}
        </InputGroup.Text>
        <input
          type={
            type !== undefined
              ? type
              : isDate
              ? "date"
              : isNumber
              ? "number"
              : "text"
          }
          placeholder={placeholder}
          className="form-control"
          value={
            isDate
              ? value.toISOString().split("T")[0]
              : isNumber
              ? value
              : isString
              ? value
              : ""
          }
          disabled={
            valueDisabled != undefined
              ? valueDisabled
              : chkbox !== undefined && !chkbox
          }
          onChange={(e) =>
            setValueFunc(
              (isDate
                ? new Date(e.target.value)
                : isNumber
                ? Number(e.target.value)
                : e.target.value) as T
            )
          }
        />
      </InputGroup>
      {explain && (
        <p className="text-secondary m-0" style={{ fontSize: "0.7rem" }}>
          {explain}
        </p>
      )}
    </div>
  );
};

export default InputGroupUI;
