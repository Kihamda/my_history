import { InputGroup } from "react-bootstrap";

const InputGroupUI = ({
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
  value: string;
  type?: string;
  setValueFunc: (value: string) => void;
  valueDisabled?: boolean;
  chkbox?: boolean;
  setChkboxFunc?: (checked: boolean) => void;
  placeholder?: string;
  className?: string;
  explain?: string;
}): React.ReactElement => {
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
          type={type}
          placeholder={placeholder}
          className="form-control"
          value={value}
          disabled={
            valueDisabled != undefined
              ? valueDisabled
              : chkbox !== undefined && !chkbox
          }
          onChange={(e) => setValueFunc(e.target.value)}
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
