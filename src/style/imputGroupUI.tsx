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
}: {
  label: string;
  value: string;
  type?: string;
  setValueFunc: (value: string) => void;
  valueDisabled?: boolean;
  chkbox?: boolean;
  setChkboxFunc?: (checked: boolean) => void;
  placeholder?: string;
}): React.ReactElement => {
  return (
    <div className="mb-3">
      <InputGroup className="mb-3">
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
    </div>
  );
};

export default InputGroupUI;
