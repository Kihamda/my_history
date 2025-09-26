import React from "react";
import { Form } from "react-bootstrap";

// FormGroupPropsインターフェースは、FormGroupコンポーネントに渡されるプロパティの型を定義します。
// controlId: フォームコントロールのID
// label: フォームコントロールのラベル
// children: フォームコントロールの子要素
interface FormGroupProps {
  controlId: string;
  label: string;
  children: React.ReactNode;
}

// FormGroupコンポーネントは、React.FC（Functional Component）として定義されています。
// controlId, label, childrenのプロパティを受け取り、BootstrapのForm.GroupとForm.Labelを使用してフォームグループを作成します。
const FormGroup: React.FC<FormGroupProps> = ({
  controlId,
  label,
  children,
}) => {
  return (
    <Form.Group controlId={controlId} className="mt-2 mb-2">
      <Form.Label>{label}</Form.Label>
      {children}
    </Form.Group>
  );
};

export default FormGroup;
